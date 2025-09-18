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

    const [conversationsResult, messagesResult, filesResult, contentResult] = await Promise.all([
      supabase.from("conversations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("files").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("generated_content").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ])

    const exportData = {
      export_info: {
        exported_by: "Red Rose AI - 100% FREE",
        export_date: new Date().toISOString(),
        user_id: user.id,
        user_email: user.email,
        total_conversations: conversationsResult.data?.length || 0,
        total_messages: messagesResult.data?.length || 0,
        total_files: filesResult.data?.length || 0,
        total_generated_content: contentResult.data?.length || 0,
      },
      conversations: conversationsResult.data || [],
      messages: messagesResult.data || [],
      files: filesResult.data || [],
      generated_content: contentResult.data || [],
      red_rose_ai_info: {
        platform: "Red Rose AI",
        cost: "$0.00 - Completely FREE",
        features: [
          "Unlimited AI chat",
          "Free file processing",
          "Free content generation",
          "Free data export",
          "More powerful than paid alternatives",
        ],
        message: "Thank you for using Red Rose AI - the most powerful FREE AI platform!",
      },
    }

    const downloadContent = JSON.stringify(exportData, null, 2)
    const filename = `red-rose-ai-complete-export-${new Date().toISOString().split("T")[0]}.json`

    return new NextResponse(downloadContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Generated-By": "Red Rose AI - 100% FREE",
      },
    })
  } catch (error) {
    console.error("Download all data error:", error)
    return NextResponse.json({ error: "Failed to download data" }, { status: 500 })
  }
}
