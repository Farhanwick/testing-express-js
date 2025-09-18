"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, ImageIcon, Code, Download, Sparkles, Copy } from "lucide-react"

interface ContentGeneratorProps {
  user: any
}

export default function ContentGenerator({ user }: ContentGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("text")
  const [textType, setTextType] = useState("default")
  const [imageStyle, setImageStyle] = useState("realistic")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeFramework, setCodeFramework] = useState("react")

  const generateContent = async (type: string) => {
    if (!prompt.trim()) return

    setLoading(true)
    setResult(null)

    try {
      let endpoint = ""
      const body: any = { prompt }

      switch (type) {
        case "text":
          endpoint = "/api/generate/text"
          body.type = textType
          break
        case "image":
          endpoint = "/api/generate/image"
          body.style = imageStyle
          break
        case "code":
          endpoint = "/api/generate/code"
          body.language = codeLanguage
          body.framework = codeFramework
          break
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({ type, ...data })
      } else {
        throw new Error("Generation failed")
      }
    } catch (error) {
      console.error("Generation error:", error)
      setResult({
        type,
        error: "Generation temporarily unavailable, but Red Rose AI remains completely FREE! Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Content Generator - 100% FREE
          </CardTitle>
          <CardDescription>
            Generate unlimited content completely FREE - more powerful than paid alternatives!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <Textarea
                placeholder="Describe what you want to generate... (completely FREE!)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] bg-background/50 border-primary/30"
              />

              <TabsContent value="text" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={textType} onValueChange={setTextType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">General Content</SelectItem>
                      <SelectItem value="article">Article/Blog</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">FREE Text Generation</Badge>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Image style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">FREE Image Generation</Badge>
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={codeFramework} onValueChange={setCodeFramework}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="node">Node.js</SelectItem>
                      <SelectItem value="vanilla">Vanilla</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">FREE Code Generation</Badge>
                </div>
              </TabsContent>

              <Button
                onClick={() => generateContent(activeTab)}
                disabled={!prompt.trim() || loading}
                className="w-full bg-primary hover:bg-primary/90 hover-glow"
              >
                {loading
                  ? "Generating FREE Content..."
                  : `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - FREE!`}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/30 glow-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content - 100% FREE</span>
              <div className="flex gap-2">
                {result.type === "text" && result.text && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.text)}
                      className="hover-glow"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadContent(result.text, "generated-text.txt")}
                      className="hover-glow"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {result.type === "code" && result.code && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.code)}
                      className="hover-glow"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadContent(
                          result.code,
                          `generated-code.${result.language === "python" ? "py" : result.language === "html" ? "html" : "js"}`,
                        )
                      }
                      className="hover-glow"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20">{result.error}</div>
            ) : (
              <div className="space-y-4">
                {result.type === "text" && (
                  <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                    <pre className="whitespace-pre-wrap text-sm">{result.text}</pre>
                  </div>
                )}

                {result.type === "image" && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={result.imageUrl || "/placeholder.svg"}
                        alt="Generated by Red Rose AI"
                        className="max-w-full h-auto rounded-lg border border-border/50"
                      />
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <pre className="whitespace-pre-wrap text-sm">{result.description}</pre>
                    </div>
                  </div>
                )}

                {result.type === "code" && (
                  <div className="space-y-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">{result.code}</pre>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <pre className="whitespace-pre-wrap text-sm">{result.explanation}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
