"use client"

import type React from "react"
import ChatInterface from "@/components/chat-interface"
import { createClient } from "@/lib/supabase/client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Code,
  ImageIcon,
  Video,
  Music,
  FileText,
  Download,
  Sparkles,
  Zap,
  Brain,
  Rocket,
  Globe,
  Shield,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function RedRoseAI() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Welcome to Red Rose AI! I am completely FREE and more powerful than ChatGPT, v0, or any paid AI service. I provide lightning-fast responses without any API costs or limitations. I can help you with unlimited tasks - from building full-stack applications to analyzing any file type. What would you like to create today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand your request: "${inputValue}". As Red Rose AI, I provide FREE and INSTANT responses with advanced capabilities. No paid APIs needed - I can analyze files, generate code, create multimedia content, and provide unlimited assistance at zero cost. What specific aspect would you like me to focus on?`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 800)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Uploaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fileMessage])

      setTimeout(() => {
        const analysisResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I've instantly analyzed your file "${file.name}" for FREE! No paid APIs required - I can process any file type including audio, video, PDF, ZIP, DOC, and more at lightning speed. What would you like me to do with this file? I can extract content, analyze data, convert formats, or integrate it into a project - all completely free!`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, analysisResponse])
      }, 600)
    }
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "100% Free AI Brain",
      description: "More powerful than paid ChatGPT, v0, Lovable AI - completely FREE forever",
      glow: "hover-glow",
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Free File Analysis",
      description: "Upload and analyze any file type instantly - no API costs or limitations",
      glow: "hover-glow",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Free Full-Stack Development",
      description: "Build complete applications with live preview - no paid services required",
      glow: "hover-glow",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Free Content Generation",
      description: "Create images, audio, video, websites - all free without API costs",
      glow: "hover-glow",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast & Free",
      description: "Instant responses with unlimited usage - no subscriptions or API fees",
      glow: "hover-glow",
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Free Export Everything",
      description: "Download any generated content or projects - completely free forever",
      glow: "hover-glow",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-futuristic text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-secondary rounded-full glow-effect flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-lg">Loading Red Rose AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-futuristic text-foreground">
      {/* Navigation */}
      {user && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full glow-effect flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Red Rose AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/generate">Generate</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/files">Files</a>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover-glow">
                <a href="/downloads">
                  <Download className="w-4 h-4 mr-2" />
                  Downloads
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
      )}

      <div className={user ? "pt-16" : ""}>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="float-effect mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full glow-effect flex items-center justify-center">
                <Rocket className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Red Rose AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
              "The most advanced FREE AI platform with lightning-fast responses. More powerful than paid alternatives,
              completely free forever - no API costs!"
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="pulse-glow-effect">
                100% FREE Forever
              </Badge>
              <Badge variant="secondary" className="pulse-glow-effect">
                Lightning Fast Response
              </Badge>
              <Badge variant="secondary" className="pulse-glow-effect">
                No Paid APIs Required
              </Badge>
              <Badge variant="secondary" className="pulse-glow-effect">
                More Powerful than ChatGPT
              </Badge>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-glow">Revolutionary FREE AI Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`bg-card/50 backdrop-blur-sm border-primary/20 ${feature.glow} transition-all duration-300`}
                >
                  <CardHeader>
                    <div className="text-primary mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Chat Interface */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-glow">Start Your FREE AI Journey</h2>
            {user ? (
              <ChatInterface user={user} />
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
                <CardHeader>
                  <CardTitle className="text-center">Sign in to start chatting with Red Rose AI</CardTitle>
                  <CardDescription className="text-center">
                    Create a free account to access unlimited AI assistance and FREE downloads
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="pulse-glow-effect">
                      <Download className="w-3 h-3 mr-1" />
                      FREE Downloads
                    </Badge>
                    <Badge variant="secondary" className="pulse-glow-effect">
                      Unlimited Export
                    </Badge>
                    <Badge variant="secondary" className="pulse-glow-effect">
                      All Data Yours
                    </Badge>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90 hover-glow">
                    <a href="/auth/sign-up">Get Started - 100% FREE</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-glow">What Red Rose AI Can Do - All FREE!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: <Code className="w-6 h-6" />, label: "Free Code Generation" },
                { icon: <ImageIcon className="w-6 h-6" />, label: "Free Image Creation" },
                { icon: <Video className="w-6 h-6" />, label: "Free Video Production" },
                { icon: <Music className="w-6 h-6" />, label: "Free Audio Generation" },
                { icon: <Globe className="w-6 h-6" />, label: "Free Web Development" },
                { icon: <FileText className="w-6 h-6" />, label: "Free Document Analysis" },
                { icon: <Shield className="w-6 h-6" />, label: "Free Error Solving" },
                { icon: <Download className="w-6 h-6" />, label: "Free Project Export" },
              ].map((capability, index) => (
                <Card
                  key={index}
                  className="bg-card/30 backdrop-blur-sm border-primary/20 hover-glow text-center p-6 transition-all duration-300"
                >
                  <div className="text-primary mb-3 flex justify-center">{capability.icon}</div>
                  <p className="text-sm font-medium">{capability.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Crafted by <span className="text-primary font-semibold">Farhan Tanvir Shuvo</span>
            </p>
            <p className="text-sm text-muted-foreground">Red Rose AI - The Future of FREE Artificial Intelligence</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
