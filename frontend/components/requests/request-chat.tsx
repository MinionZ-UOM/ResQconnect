"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message } from "@/lib/types"
import { Send, Paperclip, Bot } from "lucide-react"

interface RequestChatProps {
  requestId: string
  role: string
}

export function RequestChat({ requestId, role }: RequestChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages - in a real app, these would come from an API
  useEffect(() => {
    // Simulate loading messages
    const mockMessages: Message[] = [
      {
        id: "msg-001",
        content: "I need medical assistance. My grandfather needs insulin urgently.",
        senderId: "user-001",
        channelId: "channel-001",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "msg-002",
        content:
          "I've received your request. Can you provide more details about your location and the specific insulin type needed?",
        senderId: "user-101",
        channelId: "channel-001",
        createdAt: new Date(Date.now() - 1000 * 60 * 28), // 28 minutes ago
      },
      {
        id: "msg-003",
        content:
          "We're at 123 Main St, Apartment 4B. He needs Novolin N insulin. He's been without it for about 6 hours now.",
        senderId: "user-001",
        channelId: "channel-001",
        createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      },
      {
        id: "msg-004",
        content:
          "Based on the information provided, this is a high-priority medical request. I recommend dispatching a medical team with Novolin N insulin immediately. The patient has been without insulin for 6 hours, which could lead to hyperglycemia and potential complications.",
        senderId: "ai-assistant",
        channelId: "channel-001",
        isAIGenerated: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 24), // 24 minutes ago
      },
      {
        id: "msg-005",
        content:
          "Thank you for the additional information. A medical team has been dispatched and should arrive within 15 minutes. Please keep the patient calm and hydrated while waiting.",
        senderId: "user-101",
        channelId: "channel-001",
        createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      },
    ]

    setMessages(mockMessages)
  }, [requestId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: message,
        senderId: "current-user", // Mock current user
        channelId: "channel-001",
        createdAt: new Date(),
      }

      setMessages([...messages, newMessage])
      setMessage("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: `msg-${Date.now() + 1}`,
          content:
            "I've analyzed this conversation and noted that medical assistance is being provided. The situation appears to be under control with a response team en route. Please update the status once the insulin has been delivered.",
          senderId: "ai-assistant",
          channelId: "channel-001",
          isAIGenerated: true,
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  const getSenderName = (senderId: string) => {
    switch (senderId) {
      case "user-001":
        return "John Doe"
      case "user-101":
        return "Jane Smith"
      case "ai-assistant":
        return "AI Assistant"
      case "current-user":
        return "You"
      default:
        return "Unknown User"
    }
  }

  const getSenderInitials = (senderId: string) => {
    const name = getSenderName(senderId)
    return name === "You"
      ? "YO"
      : name
          .split(" ")
          .map((n) => n[0])
          .join("")
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === "current-user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex gap-3 max-w-[80%] ${msg.senderId === "current-user" ? "flex-row-reverse" : "flex-row"}`}
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
                    msg.senderId === "current-user"
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
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>

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
      </div>
    </div>
  )
}
