import { createClient } from "@/lib/supabase/server"
import { PostCard } from "@/components/blog/post-card"
import { Button } from "@/components/ui/button"
import { PenTool, BookOpen, Sparkles, Heart } from "lucide-react"
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6 float-animation">
            <div className="relative">
              <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 text-transparent bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text" />
              <BookOpen className="absolute -top-2 -right-2 h-6 w-6 text-pink-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8">
            <span className="gradient-text">Lakambini XI Archives</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10">
            A platform for sharing thoughts, ideas, and stories with
            <Heart className="inline h-5 w-5 mx-1 text-pink-500" />
            memories.
          </p>

          {user && (
            <Button
              asChild
              size="lg"
              className="mb-8 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/write" className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Write Your Story
                <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">
              <span className="gradient-text">Latest Stories</span>
            </h2>
            <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24">
            <div className="relative mb-8">
              <BookOpen className="h-20 w-20 sm:h-28 sm:w-28 text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text mx-auto float-animation" />
              <Sparkles className="absolute top-0 right-1/2 transform translate-x-8 h-6 w-6 text-pink-400 animate-pulse" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="gradient-text">No stories yet</span>
            </h3>

            <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Be the first to share your story and inspire others with your thoughts and experiences.
            </p>

            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/write" className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Write First Story
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/auth" className="flex items-center gap-2">
                  Get Started
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
