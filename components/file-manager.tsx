"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, ImageIcon, Music, Video, Archive, Trash2, Download } from "lucide-react"

interface FileRecord {
  id: string
  filename: string
  file_type: string
  file_size: number
  file_url: string
  processed: boolean
  analysis_result: any
  created_at: string
}

interface FileManagerProps {
  user: any
}

export default function FileManager({ user }: FileManagerProps) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch("/api/files")
      if (response.ok) {
        const { files } = await response.json()
        setFiles(files)
      }
    } catch (error) {
      console.error("Failed to load files:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      })

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId))
      }
    } catch (error) {
      console.error("Failed to delete file:", error)
    }
  }

  const downloadFile = (file: FileRecord) => {
    const link = document.createElement("a")
    link.href = file.file_url
    link.download = file.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType: string, filename: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />
    if (filename.endsWith(".zip") || filename.endsWith(".rar")) return <Archive className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
        <CardContent className="p-6">
          <div className="text-center">Loading your files...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Your Files - FREE Storage & Processing
        </CardTitle>
        <CardDescription>
          All your uploaded files processed completely FREE - no storage limits or API costs!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload any file type through the chat interface - completely FREE!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-primary">{getFileIcon(file.file_type, file.filename)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        {file.processed && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              Processed FREE
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadFile(file)} className="hover-glow">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="hover:bg-destructive/20 hover:border-destructive/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
