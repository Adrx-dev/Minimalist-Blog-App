import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, ImageIcon } from "lucide-react"
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
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {post.featured_image && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.featured_image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage
              src={post.profiles?.avatar_url || "/placeholder.svg"}
              alt={authorName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-semibold">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate font-medium">{authorName}</span>
              <span>•</span>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        <Link href={`/post/${post.slug}`}>
          <h2 className="text-lg sm:text-xl font-semibold hover:text-primary transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h2>
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        {post.excerpt && (
          <p className="text-muted-foreground line-clamp-3 mb-4 text-sm sm:text-base leading-relaxed">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/post/${post.slug}`}>
              <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                Read More
              </Badge>
            </Link>
            {post.images && post.images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                <span>{post.images.length}</span>
              </div>
            )}
          </div>
          {!post.published && <Badge variant="secondary">Draft</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}
