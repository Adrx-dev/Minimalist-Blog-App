import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, ImageIcon, Heart } from "lucide-react"
import type { Post } from "@/lib/types"
import Image from "next/image"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const authorName = post.profiles?.full_name || post.profiles?.email || "Anonymous"
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group glass-effect hover:scale-105 border-pink-100">
      {post.featured_image && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.featured_image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-4 right-4">
            <Heart className="h-5 w-5 text-white/80 hover:text-pink-400 transition-colors duration-300" />
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 ring-2 ring-pink-200 hover:ring-pink-300 transition-all duration-300">
            <AvatarImage
              src={post.profiles?.avatar_url || "/placeholder.svg"}
              alt={authorName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-blue-100 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 text-xs font-bold">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate font-medium gradient-text">{authorName}</span>
              <span className="text-pink-300">•</span>
              <Calendar className="h-3 w-3 text-pink-400" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        <Link href={`/post/${post.slug}`}>
          <h2 className="text-lg sm:text-xl font-bold hover:text-transparent hover:bg-gradient-to-r hover:from-pink-600 hover:to-blue-600 hover:bg-clip-text transition-all duration-300 line-clamp-2 leading-tight">
            {post.title}
          </h2>
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        {post.excerpt && (
          <p className="text-gray-600 line-clamp-3 mb-4 text-sm sm:text-base leading-relaxed">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/post/${post.slug}`}>
              <Badge
                variant="outline"
                className="border-pink-200 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all duration-300"
              >
                Read More
              </Badge>
            </Link>
            {post.images && post.images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-pink-500">
                <ImageIcon className="h-3 w-3" />
                <span>{post.images.length}</span>
              </div>
            )}
          </div>
          {!post.published && (
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 border-pink-200"
            >
              Draft
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
