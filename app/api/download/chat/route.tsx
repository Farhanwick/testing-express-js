import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("id")
    const format = searchParams.get("format") || "txt"

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get all messages in the conversation
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (msgError) {
      return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
    }

    let downloadContent = ""
    let filename = ""
    let contentType = "text/plain"

    if (format === "json") {
      downloadContent = JSON.stringify(
        {
          conversation,
          messages,
          exported_by: "Red Rose AI - 100% FREE",
          export_date: new Date().toISOString(),
        },
        null,
        2,
      )
      filename = `red-rose-ai-chat-${conversationId}.json`
      contentType = "application/json"
    } else if (format === "html") {
      downloadContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Red Rose AI Chat Export - 100% FREE</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0f0f23; color: #e2e8f0; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #ec4899, #8b5cf6); border-radius: 10px; }
        .message { margin: 15px 0; padding: 15px; border-radius: 10px; }
        .user { background: #1e293b; border-left: 4px solid #ec4899; }
        .assistant { background: #0f172a; border-left: 4px solid #8b5cf6; }
        .timestamp { font-size: 0.8em; opacity: 0.7; margin-top: 5px; }
        .footer { text-align: center; margin-top: 30px; padding: 15px; background: #1e293b; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌹 Red Rose AI Chat Export</h1>
        <p><strong>Conversation:</strong> ${conversation.title}</p>
        <p><strong>Created:</strong> ${new Date(conversation.created_at).toLocaleString()}</p>
        <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="messages">
        ${messages
          ?.map(
            (msg) => `
        <div class="message ${msg.role}">
            <strong>${msg.role === "user" ? "You" : "Red Rose AI"}:</strong>
            <div>${msg.content.replace(/\n/g, "<br>")}</div>
            <div class="timestamp">${new Date(msg.created_at).toLocaleString()}</div>
        </div>`,
          )
          .join("")}
    </div>
    
    <div class="footer">
        <p><strong>Exported by Red Rose AI - 100% FREE</strong></p>
        <p>More powerful than paid alternatives - completely free forever!</p>
    </div>
</body>
</html>`
      filename = `red-rose-ai-chat-${conversationId}.html`
      contentType = "text/html"
    } else {
      // Default text format
      downloadContent = `RED ROSE AI CHAT EXPORT - 100% FREE
==========================================

Conversation: ${conversation.title}
Created: ${new Date(conversation.created_at).toLocaleString()}
Exported: ${new Date().toLocaleString()}

Messages:
---------

${messages
  ?.map(
    (msg) => `
[${new Date(msg.created_at).toLocaleString()}] ${msg.role === "user" ? "You" : "Red Rose AI"}:
${msg.content}
`,
  )
  .join("\n")}

==========================================
Exported by Red Rose AI - 100% FREE
More powerful than paid alternatives - completely free forever!`
      filename = `red-rose-ai-chat-${conversationId}.txt`
    }

    return new NextResponse(downloadContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Generated-By": "Red Rose AI - 100% FREE",
      },
    })
  } catch (error) {
    console.error("Download chat error:", error)
    return NextResponse.json({ error: "Failed to download chat" }, { status: 500 })
  }
}
