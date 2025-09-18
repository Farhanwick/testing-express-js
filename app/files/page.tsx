import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FileManager from "@/components/file-manager"

export default async function FilesPage() {
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
            File Manager
          </h1>
          <p className="text-muted-foreground">
            Manage all your uploaded files - processed completely FREE with Red Rose AI
          </p>
        </div>

        <FileManager user={user} />
      </div>
    </div>
  )
}
