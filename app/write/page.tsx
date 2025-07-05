import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostForm } from "@/components/blog/post-form"

export default async function WritePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostForm />
    </div>
  )
}
