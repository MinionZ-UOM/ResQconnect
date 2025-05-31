"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebaseClient"
import { callApi } from "@/lib/api"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Plus, Users, Bot } from "lucide-react"

interface Disaster {
  id: string
  name: string
  participants: string[]
  chat_session_id: string
}

interface Message {
  id: string
  sender_id: string
  text: string
  created_at: { seconds: number; nanoseconds: number }
  trace_id?: string
}

export default function CommunicationPage({
  params,
}: {
  params: { role: string }
}) {
  const { role } = params

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [active, setActive] = useState<Disaster | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [userCache, setUserCache] = useState<Record<string, string>>({})
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [scoredTraceIds, setScoredTraceIds] = useState<Set<string>>(new Set()) // ← NEW: tracks which trace_ids have been scored
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u)
      if (!u) {
        setDisasters([])
        setActive(null)
        setMessages([])
        setUserCache({})
      }
    })
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!firebaseUser) return

    const uid = firebaseUser.uid
    const base = collection(db, "disasters")
    const q =
      role === "admin"
        ? query(base, orderBy("created_at", "desc"), limit(50))
        : query(base, where("participants", "array-contains", uid))

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Disaster, "id">),
      }))
      setDisasters(arr)
      if (!active && arr.length) setActive(arr[0])
    })
    return () => unsub()
  }, [firebaseUser, role])

  useEffect(() => {
    if (!active || active.id === "resqbot") {
      setMessages([])
      return
    }

    const msgCol = collection(
      db,
      "chatSessions",
      active.chat_session_id,
      "messages"
    )
    const q = query(msgCol, orderBy("created_at", "asc"), limit(100))
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }))
      setMessages(msgs)
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    })
    return () => unsub()
  }, [active])

  useEffect(() => {
    const missing = Array.from(new Set(messages.map((m) => m.sender_id)))
      .filter((uid) => uid !== "ai-assistant" && !(uid in userCache))

    missing.forEach(async (uid) => {
      try {
        const userSnap = await getDoc(firestoreDoc(db, "users", uid))
        const data = userSnap.data()
        const displayName =
          data?.display_name || data?.email || uid.slice(-6)
        setUserCache((prev) => ({ ...prev, [uid]: displayName }))
      } catch {
        setUserCache((prev) => ({ ...prev, [uid]: uid.slice(-6) }))
      }
    })
  }, [messages, userCache])

  const sendToChat = async () => {
    if (!text.trim() || !active || !firebaseUser) return
    const col = collection(
      db,
      "chatSessions",
      active.chat_session_id,
      "messages"
    )
    await addDoc(col, {
      sender_id: firebaseUser.uid,
      text: text.trim(),
      created_at: new Date(),
    })
    setText("")
  }

  const sendToBot = async () => {
    if (!text.trim() || !firebaseUser) return

    const now = Date.now()
    const userMsg: Message = {
      id: `user-${now}`,
      sender_id: firebaseUser.uid,
      text: text.trim(),
      created_at: {
        seconds: Math.floor(now / 1000),
        nanoseconds: 0,
      },
    }
    setMessages((prev) => [...prev, userMsg])

    const body = {
      user: {
        id: firebaseUser.uid,
        name: "Chemini",
        role: "affected_individual",
        location: {
          latitude: 8.23,
          longitude: 72.08,
        },
      },
      prompt: text.trim(),
      chat_history: [],
    }

    setText("")
    setIsBotTyping(true)

    try {
      const res = await callApi<{
        message?: string
        response?: string
        trace?: string
      }>("chatbot/ask", "POST", body)
      console.log("Bot response:", res)
      // Prioritize `response` field, fall back to `message`
      const botText = res.response || res.message || ""
      const traceId = res.trace || ""

      const botNow = Date.now()
      const botMsg: Message = {
        id: `bot-${botNow}`,
        sender_id: "ai-assistant",
        text: botText,
        created_at: {
          seconds: Math.floor(botNow / 1000),
          nanoseconds: 0,
        },
        trace_id: traceId, // ← NEW: save trace ID on the message
      }
      setMessages((prev) => [...prev, botMsg])
      setIsBotTyping(false)
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch {
      const errorNow = Date.now()
      const errorMsg: Message = {
        id: `error-${errorNow}`,
        sender_id: "ai-assistant",
        text: "Sorry, I couldn't reach the chatbot service.",
        created_at: {
          seconds: Math.floor(errorNow / 1000),
          nanoseconds: 0,
        },
      }
      setMessages((prev) => [...prev, errorMsg])
      setIsBotTyping(false)
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSend = () => {
    if (active?.id === "resqbot") {
      sendToBot()
    } else {
      sendToChat()
    }
  }

  // ← UPDATED: after scoring, we add the trace ID to scoredTraceIds
  const handleScore = async (traceId: string, value: number) => {
    if (!traceId) return
    try {
      await callApi("chatbot/score", "POST", {
        trace_id: traceId,
        value,
      })
      setScoredTraceIds((prev) => new Set(prev).add(traceId))
    } catch (e) {
      console.error("Error sending score:", e)
    }
  }

  const handleSelectResQbot = () => {
    setActive({
      id: "resqbot",
      name: "resQbot",
      participants: [],
      chat_session_id: "",
    })
  }

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Communication Hub
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Real-time communication with team members and AI assistance
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Disasters</CardTitle>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Input placeholder="Filter…" className="pl-2" disabled />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[calc(100%-5rem)]">
              <div className="p-2">
                <button
                  className={`w-full flex items-center gap-3 p-2 rounded-md text-left ${
                    active?.id === "resqbot"
                      ? "bg-green-50 dark:bg-green-900"
                      : "hover:bg-green-100 dark:hover:bg-green-800"
                  }`}
                  onClick={handleSelectResQbot}
                >
                  <Bot className="h-8 w-8 text-green-500 bg-green-100 dark:bg-green-900 p-1.5 rounded-md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">resQbot</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Pinned Chat
                    </div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    AI
                  </Badge>
                </button>
              </div>
              <div className="border-b my-2" />
              <div className="space-y-1 p-2">
                {disasters.map((d) => (
                  <button
                    key={d.id}
                    className={`w-full flex items-center gap-3 p-2 rounded-md text-left ${
                      active?.id === d.id
                        ? "bg-blue-50 dark:bg-blue-900"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setActive(d)}
                  >
                    <Users className="h-8 w-8 text-blue-500 bg-blue-100 dark:bg-blue-900 p-1.5 rounded-md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{d.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {d.participants.length} participants
                      </div>
                    </div>
                    {d.chat_session_id && (
                      <Badge variant="outline" className="flex-shrink-0">
                        Live
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            {active ? (
              <>
                <CardHeader className="p-4 border-b flex items-center justify-between">
                  <div>
                    <CardTitle>{active.name}</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {active.id === "resqbot"
                        ? "AI Chat"
                        : `${active.participants.length} participants`}
                    </p>
                  </div>
                  {active.id !== "resqbot" && (
                    <Badge variant="outline">Live</Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {active.id === "resqbot" ? (
                      <>
                        {messages.length === 0 && !isBotTyping && (
                          <div className="text-center text-slate-500 dark:text-slate-400">
                            Start a conversation with resQbot.
                          </div>
                        )}
                        {messages.map((m) => {
                          const isMe = m.sender_id === firebaseUser?.uid
                          const isAI = m.sender_id === "ai-assistant"
                          const name = isAI
                            ? "resQbot"
                            : userCache[m.sender_id] || m.sender_id.slice(-6)

                          return (
                            <div
                              key={m.id}
                              className={`flex ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`flex gap-3 max-w-[80%] ${
                                  isMe ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <Avatar
                                  className={
                                    isAI ? "bg-blue-100 text-blue-600" : ""
                                  }
                                >
                                  <AvatarFallback>
                                    {isAI ? <Bot className="h-4 w-4" /> : name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {name}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {new Date(
                                        m.created_at.seconds * 1000
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {isAI && (
                                      <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                        AI
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`p-3 rounded-lg ${
                                      isMe
                                        ? "bg-green-500 text-white"
                                        : isAI
                                        ? "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 whitespace-pre-wrap"
                                        : "bg-slate-100 dark:bg-slate-800"
                                    }`}
                                  >
                                    {m.text}
                                  </div>

                                  {isAI && m.trace_id && (
                                    <div
                                      className={`flex gap-2 mt-1 overflow-hidden transition-all duration-300 ${
                                        scoredTraceIds.has(m.trace_id)
                                          ? "opacity-0 max-h-0"
                                          : "opacity-100 max-h-10"
                                      }`}
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleScore(m.trace_id || "", 1)
                                        }
                                      >
                                        Like
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleScore(m.trace_id || "", -1)
                                        }
                                      >
                                        Dislike
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {isBotTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%] flex-row">
                              <Avatar className="bg-blue-100 text-blue-600">
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    resQbot
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    typing...
                                  </span>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 flex items-center">
                                  <div className="flex gap-1">
                                    <span
                                      className="bg-slate-400 dark:bg-slate-600 w-2 h-2 rounded-full animate-bounce"
                                      style={{ animationDelay: "0s" }}
                                    />
                                    <span
                                      className="bg-slate-400 dark:bg-slate-600 w-2 h-2 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    />
                                    <span
                                      className="bg-slate-400 dark:bg-slate-600 w-2 h-2 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.4s" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.sender_id === firebaseUser?.uid
                        const isAI = m.sender_id === "ai-assistant"
                        const name = isAI
                          ? "AI Assistant"
                          : userCache[m.sender_id] || m.sender_id.slice(-6)

                        return (
                          <div
                            key={m.id}
                            className={`flex ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex gap-3 max-w-[80%] ${
                                isMe ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <Avatar
                                className={
                                  isAI ? "bg-blue-100 text-blue-600" : ""
                                }
                              >
                                <AvatarFallback>
                                  {isAI ? <Bot className="h-4 w-4" /> : name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {name}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(
                                      m.created_at.seconds * 1000
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isAI && (
                                    <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                      AI
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`p-3 rounded-lg ${
                                    isMe
                                      ? "bg-blue-500 text-white"
                                      : isAI
                                      ? "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"
                                      : "bg-slate-100 dark:bg-slate-800"
                                  }`}
                                >
                                  {m.text}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={endRef} />
                  </div>
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                          active.id === "resqbot"
                            ? "Type your message to resQbot..."
                            : "Type your message..."
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        className="min-h-10 flex-1"
                      />
                      <Button onClick={handleSend} disabled={!text.trim() || !firebaseUser}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {active.id !== "resqbot" && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        AI assistant is monitoring this channel and will provide insights when relevant.
                      </p>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium mb-2">No Disaster Selected</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Select a disaster from the sidebar to start communicating
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>    
      </div>
    </div>
  )
}
