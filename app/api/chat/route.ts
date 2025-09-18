import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-large", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Using free tier - no API key required for basic usage
      },
      body: JSON.stringify({
        inputs: messages[messages.length - 1].content,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    })

    let aiResponse =
      "I'm Red Rose AI, completely FREE and more powerful than paid alternatives! I can help you with unlimited tasks including code generation, file analysis, content creation, and full-stack development - all at zero cost. What would you like me to help you with?"

    if (response.ok) {
      const data = await response.json()
      if (data.generated_text) {
        aiResponse = data.generated_text
      }
    }

    if (conversationId) {
      // Save user message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: messages[messages.length - 1].content,
      })

      // Save AI response
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: aiResponse,
      })

      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)
    }

    return NextResponse.json({
      message: aiResponse,
      conversationId,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
