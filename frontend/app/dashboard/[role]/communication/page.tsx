"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Channel, Message } from "@/lib/types"
import { Send, Search, Plus, Bot, Users, AlertTriangle } from "lucide-react"

interface CommunicationPageProps {
  params: {
    role: string
  }
}

export default function CommunicationPage({ params }: CommunicationPageProps) {
  const role = params.role
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock channels - in a real app, these would come from an API
  const mockChannels: Channel[] = [
    {
      id: "channel-001",
      name: "General",
      participants: ["user-001", "user-101", "user-102", "user-103"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      id: "channel-002",
      name: "Medical Team",
      participants: ["user-101", "user-102"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: "channel-003",
      name: "Evacuation Coordination",
      participants: ["user-101", "user-103", "user-104"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: "channel-004",
      name: "Food Distribution",
      participants: ["user-102", "user-105"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      id: "channel-005",
      name: "Rescue Team Alpha",
      participants: ["user-101", "user-106", "user-107"],
      taskId: "task-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
  ]

  // Filter channels based on role
  const filteredChannels =
    role === "admin"
      ? mockChannels
      : mockChannels.filter(
          (channel) => channel.participants.includes("user-101"), // Mock current user
        )

  // Filter channels based on search query
  const searchedChannels = searchQuery
    ? filteredChannels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredChannels

  // Set first channel as active by default
  useEffect(() => {
    if (searchedChannels.length > 0 && !activeChannel) {
      setActiveChannel(searchedChannels[0])
    }
  }, [searchedChannels, activeChannel])

  // Load messages when active channel changes
  useEffect(() => {
    if (activeChannel) {
      // Mock messages - in a real app, these would come from an API
      const mockMessages: Message[] = [
        {
          id: "msg-001",
          content: "Welcome to the channel!",
          senderId: "user-101",
          channelId: activeChannel.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        {
          id: "msg-002",
          content: "I need an update on the current situation in the north district.",
          senderId: "user-102",
          channelId: activeChannel.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
        },
        {
          id: "msg-003",
          content:
            "Based on the latest reports, the north district is experiencing moderate flooding. Three streets are currently inaccessible by vehicle. Emergency services should use the eastern approach via Highland Avenue.",
          senderId: "ai-assistant",
          channelId: activeChannel.id,
          isAIGenerated: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 54), // 54 minutes ago
        },
        {
          id: "msg-004",
          content: "Thanks for the info. We'll reroute our teams accordingly.",
          senderId: "user-103",
          channelId: activeChannel.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        },
        {
          id: "msg-005",
          content: "We have 3 medical teams ready to deploy. Where should we send them first?",
          senderId: "user-101",
          channelId: activeChannel.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        },
        {
          id: "msg-006",
          content:
            "Prioritize the community center on Maple Street. We have reports of 20+ people needing medical attention there.",
          senderId: "user-102",
          channelId: activeChannel.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        },
        {
          id: "msg-007",
          content:
            "I've analyzed the incoming requests and current resource allocation. The community center should receive 2 medical teams, while 1 team should be sent to the elementary school which has 12 people needing attention but with more critical cases.",
          senderId: "ai-assistant",
          channelId: activeChannel.id,
          isAIGenerated: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 39), // 39 minutes ago
        },
      ]

      setMessages(mockMessages)
    }
  }, [activeChannel])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim() && activeChannel) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: message,
        senderId: "user-101", // Mock current user
        channelId: activeChannel.id,
        createdAt: new Date(),
      }

      setMessages([...messages, newMessage])
      setMessage("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: `msg-${Date.now() + 1}`,
          content:
            "I've analyzed your message and updated our coordination system. Based on current data, your team should proceed with the planned actions while being aware that weather conditions may change in the next 2-3 hours.",
          senderId: "ai-assistant",
          channelId: activeChannel.id,
          isAIGenerated: true,
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  const getSenderName = (senderId: string) => {
    switch (senderId) {
      case "user-101":
        return "Jane Smith"
      case "user-102":
        return "Michael Johnson"
      case "user-103":
        return "Sarah Williams"
      case "ai-assistant":
        return "AI Assistant"
      default:
        return "Unknown User"
    }
  }

  const getSenderInitials = (senderId: string) => {
    const name = getSenderName(senderId)
    return name === "AI Assistant"
      ? "AI"
      : name
          .split(" ")
          .map((n) => n[0])
          .join("")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Communication Hub</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Real-time communication with team members and AI assistance
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Channels</CardTitle>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search channels"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[calc(100%-5rem)]">
              <div className="space-y-1 p-2">
                {searchedChannels.map((channel) => (
                  <button
                    key={channel.id}
                    className={`w-full flex items-center gap-3 p-2 rounded-md text-left ${
                      activeChannel?.id === channel.id
                        ? "bg-blue-50 dark:bg-blue-900"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setActiveChannel(channel)}
                  >
                    <div className="flex-shrink-0">
                      {channel.taskId ? (
                        <AlertTriangle className="h-8 w-8 text-orange-500 bg-orange-100 dark:bg-orange-900 p-1.5 rounded-md" />
                      ) : (
                        <Users className="h-8 w-8 text-blue-500 bg-blue-100 dark:bg-blue-900 p-1.5 rounded-md" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{channel.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {channel.participants.length} participants
                      </div>
                    </div>
                    {channel.taskId && (
                      <Badge variant="outline" className="flex-shrink-0">
                        Task
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
            {activeChannel ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{activeChannel.name}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {activeChannel.participants.length} participants
                      </p>
                    </div>
                    {activeChannel.taskId && <Badge variant="outline">Task: {activeChannel.taskId}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === "user-101" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            msg.senderId === "user-101" ? "flex-row-reverse" : "flex-row"
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
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {msg.isAIGenerated && (
                                <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                  AI
                                </span>
                              )}
                            </div>

                            <div
                              className={`p-3 rounded-lg ${
                                msg.senderId === "user-101"
                                  ? "bg-blue-500 text-white"
                                  : msg.isAIGenerated
                                    ? "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"
                                    : "bg-slate-100 dark:bg-slate-800"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-10 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />

                      <Button onClick={handleSendMessage} disabled={!message.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      AI assistant is monitoring this channel and will provide insights when relevant.
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium mb-2">No Channel Selected</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Select a channel from the sidebar to start communicating
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
