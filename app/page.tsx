import { createClient } from "@/lib/supabase/server"
import { PostCard } from "@/components/blog/post-card"
import { Button } from "@/components/ui/button"
import { PenTool, BookOpen } from "lucide-react"
import Link from "next/link"
import type { Post } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    .eq("published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Welcome to MiniBlog
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
            A minimalist platform for sharing thoughts, ideas, and stories with beautiful imagery.
          </p>

          {user && (
            <Button asChild size="lg" className="mb-8">
              <Link href="/write" className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Write Your Story
              </Link>
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">Latest Stories</h2>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24">
            <BookOpen className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">No stories yet</h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
              Be the first to share your story and inspire others with your thoughts and experiences.
            </p>
            {user ? (
              <Button asChild size="lg">
                <Link href="/write" className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Write First Story
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/auth">Get Started</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
