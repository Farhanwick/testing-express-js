import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DownloadCenter from "@/components/download-center"

export default async function DownloadsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-futuristic text-foreground p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Download Center
          </h1>
          <p className="text-muted-foreground">
            Download all your content, chats, and files - completely FREE with Red Rose AI
          </p>
        </div>

        <DownloadCenter user={user} />
      </div>
    </div>
  )
}
