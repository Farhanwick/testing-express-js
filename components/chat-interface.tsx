"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Upload, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

interface ChatInterfaceProps {
  user: any
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initializeConversation()
  }, [])

  const initializeConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Red Rose AI Chat" }),
      })

      if (response.ok) {
        const { conversation } = await response.json()
        setConversationId(conversation.id)

        // Add welcome message
        const welcomeMessage: Message = {
          id: "welcome",
          content:
            "Welcome to Red Rose AI! I am completely FREE and more powerful than ChatGPT, v0, or any paid AI service. I provide lightning-fast responses without any API costs or limitations. I can help you with unlimited tasks - from building full-stack applications to analyzing any file type. What would you like to create today?",
          role: "assistant",
          created_at: new Date().toISOString(),
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: inputValue }],
          conversationId,
        }),
      })

      if (response.ok) {
        const { message } = await response.json()
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: message,
          role: "assistant",
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error("Failed to get AI response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm experiencing a temporary issue, but don't worry - Red Rose AI is still completely FREE! Please try again. I'm here to help with unlimited tasks at zero cost.",
        role: "assistant",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && conversationId) {
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Uploaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        role: "user",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fileMessage])

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("conversationId", conversationId)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const { analysis } = await response.json()
          const analysisMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              analysis ||
              `I've successfully processed your file "${file.name}" for FREE! I can analyze any file type including documents, images, audio, video, and code. What would you like me to do with this file? I can extract content, analyze data, convert formats, or integrate it into a project - all completely free!`,
            role: "assistant",
            created_at: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, analysisMessage])
        }
      } catch (error) {
        console.error("File upload error:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `File upload is temporarily unavailable, but Red Rose AI remains completely FREE! I can still help you with unlimited tasks including code generation, content creation, and problem-solving at zero cost.`,
          role: "assistant",
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Red Rose AI Chat - 100% FREE
        </CardTitle>
        <CardDescription>
          Experience unlimited FREE AI assistance with lightning-fast responses - no API costs ever!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 mb-4 p-4 border border-border/50 rounded-lg bg-background/50">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground hover-glow"
                    : "bg-secondary/20 text-foreground border border-secondary/30"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-secondary/20 text-foreground p-3 rounded-lg border border-secondary/30">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Red Rose AI anything - completely FREE!"
            className="flex-1 bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/50"
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={handleFileUpload}
            variant="outline"
            size="icon"
            className="border-secondary/50 hover:border-secondary hover-glow bg-transparent"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90 hover-glow"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="*/*" />
      </CardContent>
    </Card>
  )
}
