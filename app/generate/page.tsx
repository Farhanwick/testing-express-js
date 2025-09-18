import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ContentGenerator from "@/components/content-generator"

export default async function GeneratePage() {
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
            AI Content Generator
          </h1>
          <p className="text-muted-foreground">
            Generate unlimited text, images, and code completely FREE with Red Rose AI
          </p>
        </div>

        <ContentGenerator user={user} />
      </div>
    </div>
  )
}
