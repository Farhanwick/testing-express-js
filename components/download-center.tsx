"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileText, MessageCircle, ImageIcon, Code, Database, Archive } from "lucide-react"

interface DownloadCenterProps {
  user: any
}

interface DownloadItem {
  id: string
  type: "conversation" | "content" | "file"
  title: string
  created_at: string
  content_type?: string
  size?: string
}

export default function DownloadCenter({ user }: DownloadCenterProps) {
  const [items, setItems] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    loadDownloadableItems()
  }, [])

  const loadDownloadableItems = async () => {
    try {
      const [conversationsRes, contentRes, filesRes] = await Promise.all([
        fetch("/api/conversations"),
        fetch("/api/generated_content"),
        fetch("/api/files"),
      ])

      const conversations = conversationsRes.ok ? (await conversationsRes.json()).conversations || [] : []
      const content = contentRes.ok ? (await contentRes.json()).content || [] : []
      const files = filesRes.ok ? (await filesRes.json()).files || [] : []

      const allItems: DownloadItem[] = [
        ...conversations.map((conv: any) => ({
          id: conv.id,
          type: "conversation" as const,
          title: conv.title,
          created_at: conv.created_at,
        })),
        ...content.map((item: any) => ({
          id: item.id,
          type: "content" as const,
          title: `${item.content_type} - ${item.prompt.substring(0, 50)}...`,
          created_at: item.created_at,
          content_type: item.content_type,
        })),
        ...files.map((file: any) => ({
          id: file.id,
          type: "file" as const,
          title: file.filename,
          created_at: file.created_at,
          size: `${(file.file_size / 1024 / 1024).toFixed(2)} MB`,
        })),
      ]

      setItems(allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error("Failed to load downloadable items:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadItem = async (item: DownloadItem, format = "txt") => {
    setDownloading(item.id)
    try {
      let url = ""
      if (item.type === "conversation") {
        url = `/api/download/chat?id=${item.id}&format=${format}`
      } else if (item.type === "content") {
        url = `/api/download/content?id=${item.id}&format=${format}`
      } else if (item.type === "file") {
        // For files, we'll download the original file
        const response = await fetch(`/api/files/${item.id}`)
        if (response.ok) {
          const { file } = await response.json()
          const link = document.createElement("a")
          link.href = file.file_url
          link.download = file.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }

      if (url) {
        const link = document.createElement("a")
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(null)
    }
  }

  const downloadAllData = async () => {
    setDownloading("all")
    try {
      const link = document.createElement("a")
      link.href = "/api/download/all-data"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download all data failed:", error)
    } finally {
      setDownloading(null)
    }
  }

  const getItemIcon = (item: DownloadItem) => {
    if (item.type === "conversation") return <MessageCircle className="w-5 h-5" />
    if (item.type === "file") return <FileText className="w-5 h-5" />
    if (item.content_type === "image") return <ImageIcon className="w-5 h-5" />
    if (item.content_type === "code") return <Code className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
        <CardContent className="p-6">
          <div className="text-center">Loading your downloadable content...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Download All Data Card */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Complete Data Export - 100% FREE
          </CardTitle>
          <CardDescription>
            Download all your Red Rose AI data in one comprehensive file - completely FREE!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Everything</p>
              <p className="text-sm text-muted-foreground">
                All conversations, generated content, files, and data in JSON format
              </p>
            </div>
            <Button
              onClick={downloadAllData}
              disabled={downloading === "all"}
              className="bg-primary hover:bg-primary/90 hover-glow"
            >
              {downloading === "all" ? (
                "Exporting..."
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Export All Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Items */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Download Center - FREE Downloads
          </CardTitle>
          <CardDescription>Download any of your content, chats, or files - no limits, completely FREE!</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No downloadable content yet</p>
              <p className="text-sm">Start chatting or generating content to see downloadable items here!</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-primary">{getItemIcon(item)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          {item.size && (
                            <>
                              <span>•</span>
                              <span>{item.size}</span>
                            </>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            FREE Download
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === "conversation" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadItem(item, "txt")}
                            disabled={downloading === item.id}
                            className="hover-glow"
                          >
                            TXT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadItem(item, "html")}
                            disabled={downloading === item.id}
                            className="hover-glow"
                          >
                            HTML
                          </Button>
                        </>
                      )}
                      {item.type === "content" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadItem(item, "txt")}
                            disabled={downloading === item.id}
                            className="hover-glow"
                          >
                            {item.content_type === "code" ? "Code" : "TXT"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadItem(item, "json")}
                            disabled={downloading === item.id}
                            className="hover-glow"
                          >
                            JSON
                          </Button>
                        </>
                      )}
                      {item.type === "file" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadItem(item)}
                          disabled={downloading === item.id}
                          className="hover-glow"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
