import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const conversationId = formData.get("conversationId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name
    const fileSize = file.size

    // Convert file to base64 for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")

    let analysis = ""
    let processedData: any = {}

    if (fileType.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      const textContent = buffer.toString("utf-8")
      analysis = `📄 **Text File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024).toFixed(2)} KB\n**Lines:** ${textContent.split("\n").length}\n**Characters:** ${textContent.length}\n\n**Content Preview:**\n${textContent.substring(0, 500)}${textContent.length > 500 ? "..." : ""}\n\n✅ **Red Rose AI Analysis:** This text file has been processed completely FREE! I can help you:\n- Summarize the content\n- Extract key information\n- Convert to different formats\n- Generate code based on requirements\n- Create documentation\n\nWhat would you like me to do with this content?`

      processedData = { textContent, wordCount: textContent.split(" ").length }
    } else if (fileType.startsWith("image/")) {
      analysis = `🖼️ **Image File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n**Type:** ${fileType}\n\n✅ **Red Rose AI Analysis:** Your image has been processed completely FREE! I can help you:\n- Describe the image content\n- Extract text from images (OCR)\n- Resize or convert formats\n- Generate similar images\n- Create variations\n- Use in web development projects\n\nWhat would you like me to do with this image?`

      processedData = { imageType: fileType, base64Preview: `data:${fileType};base64,${base64.substring(0, 100)}...` }
    } else if (fileType.startsWith("audio/")) {
      analysis = `🎵 **Audio File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n**Type:** ${fileType}\n\n✅ **Red Rose AI Analysis:** Your audio file has been processed completely FREE! I can help you:\n- Transcribe audio to text\n- Analyze audio content\n- Convert to different formats\n- Extract metadata\n- Generate similar audio\n- Create audio variations\n\nWhat would you like me to do with this audio file?`

      processedData = { audioType: fileType, duration: "Processing..." }
    } else if (fileType.startsWith("video/")) {
      analysis = `🎬 **Video File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n**Type:** ${fileType}\n\n✅ **Red Rose AI Analysis:** Your video file has been processed completely FREE! I can help you:\n- Extract frames from video\n- Transcribe video audio\n- Analyze video content\n- Convert to different formats\n- Generate thumbnails\n- Create video summaries\n\nWhat would you like me to do with this video?`

      processedData = { videoType: fileType, size: fileSize }
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      analysis = `📋 **PDF Document Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n\n✅ **Red Rose AI Analysis:** Your PDF has been processed completely FREE! I can help you:\n- Extract text content\n- Summarize the document\n- Convert to other formats\n- Extract images from PDF\n- Generate questions/answers\n- Create study notes\n\nWhat would you like me to do with this PDF?`

      processedData = { documentType: "PDF", pages: "Processing..." }
    } else if (fileName.endsWith(".zip") || fileName.endsWith(".rar") || fileName.endsWith(".7z")) {
      analysis = `📦 **Archive File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n**Type:** Archive\n\n✅ **Red Rose AI Analysis:** Your archive has been processed completely FREE! I can help you:\n- List archive contents\n- Extract specific files\n- Analyze code projects\n- Convert archive formats\n- Process contained files\n- Generate project documentation\n\nWhat would you like me to do with this archive?`

      processedData = { archiveType: fileType, compressed: true }
    } else if (fileName.endsWith(".json") || fileName.endsWith(".xml") || fileName.endsWith(".csv")) {
      const textContent = buffer.toString("utf-8")
      analysis = `📊 **Data File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024).toFixed(2)} KB\n**Type:** ${fileName.split(".").pop()?.toUpperCase()} Data\n\n**Content Preview:**\n${textContent.substring(0, 300)}${textContent.length > 300 ? "..." : ""}\n\n✅ **Red Rose AI Analysis:** Your data file has been processed completely FREE! I can help you:\n- Parse and analyze data\n- Convert between formats (JSON/CSV/XML)\n- Generate visualizations\n- Create database schemas\n- Extract insights\n- Generate reports\n\nWhat would you like me to do with this data?`

      processedData = { dataType: fileName.split(".").pop(), content: textContent }
    } else {
      analysis = `📁 **File Analysis - FREE Processing**\n\n**File:** ${fileName}\n**Size:** ${(fileSize / 1024 / 1024).toFixed(2)} MB\n**Type:** ${fileType || "Unknown"}\n\n✅ **Red Rose AI Analysis:** Your file has been processed completely FREE! Even though this is a specialized file type, I can still help you:\n- Analyze file structure\n- Convert to supported formats\n- Extract metadata\n- Process with specialized tools\n- Integrate into projects\n- Provide format-specific assistance\n\nWhat would you like me to do with this file?`

      processedData = { fileType, specialFormat: true }
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        filename: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_url: `data:${fileType};base64,${base64}`, // Store as data URL for now
        processed: true,
        analysis_result: processedData,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
    }

    return NextResponse.json({
      analysis,
      fileId: fileRecord?.id,
      processed: true,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 })
  }
}
