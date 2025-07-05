import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostCard } from "@/components/blog/post-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  const publishedPosts = posts?.filter((post) => post.published) || []
  const draftPosts = posts?.filter((post) => !post.published) || []

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
                <AvatarFallback className="text-lg">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.user_metadata?.full_name || "Anonymous User"}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{publishedPosts.length}</span>
                <span className="text-muted-foreground ml-1">Published Posts</span>
              </div>
              <div>
                <span className="font-semibold">{draftPosts.length}</span>
                <span className="text-muted-foreground ml-1">Drafts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {draftPosts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold">Drafts</h2>
              <Badge variant="secondary">{draftPosts.length}</Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {draftPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Published Posts</h2>
            <Badge variant="outline">{publishedPosts.length}</Badge>
          </div>
          {publishedPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {publishedPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No published posts yet. Start writing to share your thoughts!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
