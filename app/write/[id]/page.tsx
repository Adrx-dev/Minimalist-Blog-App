import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { PostForm } from "@/components/blog/post-form"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: post } = await supabase.from("posts").select("*").eq("id", id).eq("author_id", user.id).single()

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostForm post={post} isEditing={true} />
    </div>
  )
}
