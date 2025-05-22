"use client"

import React, { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Message, Channel, User, UserRole } from "@/lib/types"
import { Bot } from "lucide-react"

interface ChatInterfaceProps {
  currentUserId: string
  currentUserRole: UserRole
  disasterId?: string
  requestId?: string
  taskId?: string
  recipientId?: string
  onSendMessage?: (message: string, attachments?: File[]) => void
}

export function ChatInterface({
  currentUserId,
  currentUserRole,
  disasterId,
  requestId,
  taskId,
  recipientId,
  onSendMessage,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState<"channels" | "direct">("channels")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock users
  const mockUsers: User[] = [
    { id: "user-101", name: "John Smith", email: "john.smith@example.com", role: "Responder", avatar: "", createdAt: new Date() },
    { id: "user-102", name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "Responder", avatar: "", createdAt: new Date() },
    { id: "user-103", name: "Michael Brown", email: "michael.brown@example.com", role: "Volunteer", avatar: "", createdAt: new Date() },
    { id: "user-104", name: "Emily Davis", email: "emily.davis@example.com", role: "Volunteer", avatar: "", createdAt: new Date() },
    { id: "user-105", name: "David Wilson", email: "david.wilson@example.com", role: "Affected", avatar: "", createdAt: new Date() },
    { id: "user-106", name: "AI Assistant", email: "ai@resqconnect.com", role: "Admin", avatar: "", createdAt: new Date() },
  ]

  // Load channels
  useEffect(() => {
    const mockChannels: Channel[] = [
      {
        id: "channel-001",
        name: "General",
        disasterId: "disaster-001",
        participants: ["user-101","user-102","user-103","user-104","user-105","user-106"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: "channel-002",
        name: "Medical Team",
        disasterId: "disaster-001",
        participants: ["user-101","user-102","user-106"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "channel-003",
        name: "Evacuation Coordination",
        disasterId: "disaster-002",
        participants: ["user-101","user-103","user-104","user-106"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
    ]

    const filtered = disasterId
      ? mockChannels.filter((c) => c.disasterId === disasterId)
      : mockChannels
    const userChannels = filtered.filter((c) => c.participants.includes(currentUserId))

    setChannels(userChannels)
    if (userChannels.length) setActiveChannel(userChannels[0])
  }, [disasterId, currentUserId])

  // Load messages for active channel
  useEffect(() => {
    if (!activeChannel) return

    const mockMessages: Message[] = [
      { id: "msg-001", content: "Welcome to the channel!", senderId: "user-101", channelId: activeChannel.id, disasterId: activeChannel.disasterId, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      { id: "msg-002", content: "I need an update on the current situation in the north district.", senderId: "user-102", channelId: activeChannel.id, disasterId: activeChannel.disasterId, createdAt: new Date(Date.now() - 1000 * 60 * 55) },
      { id: "msg-003", content: "Based on the latest reports, the north district is experiencing moderate flooding. Three streets are currently inaccessible by vehicle. Emergency services should use the eastern approach via Highland Avenue.", senderId: "user-106", channelId: activeChannel.id, disasterId: activeChannel.disasterId, isAIGenerated: true, createdAt: new Date(Date.now() - 1000 * 60 * 54) },
      { id: "msg-004", content: "Thanks for the info. We'll reroute our teams accordingly.", senderId: "user-103", channelId: activeChannel.id, disasterId: activeChannel.disasterId, createdAt: new Date(Date.now() - 1000 * 60 * 50) },
      { id: "msg-005", content: "We have 3 medical teams ready to deploy. Where should we send them first?", senderId: currentUserId, channelId: activeChannel.id, disasterId: activeChannel.disasterId, createdAt: new Date(Date.now() - 1000 * 60 * 45) },
      { id: "msg-006", content: "Prioritize the community center on Maple Street. We have reports of 20+ people needing medical attention there.", senderId: "user-102", channelId: activeChannel.id, disasterId: activeChannel.disasterId, createdAt: new Date(Date.now() - 1000 * 60 * 40) },
      { id: "msg-007", content: "I've analyzed the incoming requests and current resource allocation. The community center should receive 2 medical teams, while 1 team should be sent to the elementary school which has 12 people needing attention but with more critical cases.", senderId: "user-106", channelId: activeChannel.id, disasterId: activeChannel.disasterId, isAIGenerated: true, createdAt: new Date(Date.now() - 1000 * 60 * 39) },
    ]

    setMessages(mockMessages)
  }, [activeChannel, currentUserId])

  // Auto‐scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handlers
  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || !activeChannel) return

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      senderId: currentUserId,
      channelId: activeChannel.id,
      disasterId: activeChannel.disasterId,
      attachmentUrls: attachments.map((f) => URL.createObjectURL(f)),
      createdAt: new Date(),
    }
    setMessages((ms) => [...ms, newMsg])
    setMessage("")
    setAttachments([])

    onSendMessage?.(message, attachments)

    // Simulate AI reply
    setTimeout(() => {
      setMessages((ms) => [
        ...ms,
        {
          id: `msg-${Date.now()+1}`,
          content:
            "I've analyzed your message and updated our coordination system. Based on current data, your team should proceed with the planned actions while being aware that weather conditions may change in the next 2-3 hours.",
          senderId: "user-106",
          channelId: activeChannel.id,
          disasterId: activeChannel.disasterId,
          isAIGenerated: true,
          createdAt: new Date(),
        },
      ])
    }, 1500)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachments((a) => [...a, ...Array.from(e.target.files)])
  }

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((a) => a.filter((_, i) => i !== idx))
  }

  const toggleVoiceRecording = () => {
    setIsRecording((r) => !r)
    // integrate actual recording logic here
  }

  const getSenderName = (senderId: string) => {
    return mockUsers.find((u) => u.id === senderId)?.name ?? "Unknown User"
  }

  const getSenderInitials = (senderId: string) => {
    const name = getSenderName(senderId)
    if (name === "AI Assistant") return "AI"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {activeChannel ? activeChannel.name : "Chat"}
            {taskId    && <Badge className="ml-2">Task</Badge>}
            {requestId && <Badge className="ml-2">Request</Badge>}
          </CardTitle>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="direct">Direct Messages</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r overflow-y-auto p-2 hidden md:block">
          <TabsContent value="channels" className="m-0">
            <div className="font-medium text-sm mb-2">Channels</div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className={`w-full flex items-center gap-2 p-2 rounded-md text-left text-sm ${
                    activeChannel?.id === channel.id
                      ? "bg-blue-50 dark:bg-blue-900"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveChannel(channel)}
                >
                  <span className="truncate"># {channel.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="direct" className="m-0">
            <div className="font-medium text-sm mb-2">Direct Messages</div>
            <div className="space-y-1">
              {mockUsers
                .filter((u) => u.id !== currentUserId)
                .map((user) => (
                  <button
                    key={user.id}
                    className="w-full flex items-center gap-2 p-2 rounded-md text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => console.log("Open DM with:", user.name)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name === "AI Assistant" ? <Bot className="h-3 w-3" /> : user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </button>
                ))}
            </div>
          </TabsContent>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    msg.senderId === currentUserId ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className={msg.isAIGenerated ? "bg-blue-100 text-blue-600" : undefined}>
                    <AvatarImage src="/placeholder.svg" alt={getSenderName(msg.senderId)} />
                    <AvatarFallback>
                      {msg.isAIGenerated ? <Bot className="h-4 w-4" /> : getSenderInitials(msg.senderId)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{getSenderName(msg.senderId)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.isAIGenerated && (
                        <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                          AI
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        msg.senderId === currentUserId
                          ? "bg-blue-500 text-white"
                          : msg.isAIGenerated
                          ? "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      {msg.content}
                      {msg.attachmentUrls?.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {msg.attachmentUrls.map((url, idx) => (
                            <div key={idx} className="relative rounded-md overflow-hidden">
                              <img
                                src={url}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-24 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceRecording}
                className="px-3 py-2 border rounded"
              >
                {isRecording ? "Stop Recording" : "Record Voice"}
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded"
              />

              <button
                onClick={handleFileUpload}
                className="px-3 py-2 border rounded"
              >
                Attach File
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim() && attachments.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Send
              </button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 p-2 bg-gray-100 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button onClick={() => handleRemoveAttachment(idx)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
