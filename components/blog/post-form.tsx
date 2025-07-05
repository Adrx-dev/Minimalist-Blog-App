"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { createClient } from "@/lib/supabase/client"
import { generateSlug } from "@/lib/utils/slug"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/lib/types"
import { Save, Eye } from "lucide-react"

interface PostFormProps {
  post?: Post
  isEditing?: boolean
}

export function PostForm({ post, isEditing = false }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [published, setPublished] = useState(post?.published || false)
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || "")
  const [images, setImages] = useState<string[]>(post?.images || [])

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleImageAdd = (imageUrl: string, altText?: string, caption?: string) => {
    setImages((prev) => [...prev, imageUrl])

    // Set as featured image if it's the first image
    if (!featuredImage && images.length === 0) {
      setFeaturedImage(imageUrl)
    }
  }

  const handleImageRemove = (imageUrl: string) => {
    setImages((prev) => prev.filter((img) => img !== imageUrl))

    // Remove from featured image if it matches
    if (featuredImage === imageUrl) {
      setFeaturedImage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a post",
          variant: "destructive",
        })
        return
      }

      const slug = generateSlug(title)
      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        images: images.length > 0 ? images : null,
        published,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let error
      if (isEditing && post) {
        const { error: updateError } = await supabase.from("posts").update(postData).eq("id", post.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("posts").insert([postData])
        error = insertError
      }

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Post ${isEditing ? "updated" : "created"} successfully`,
        })
        router.push(`/post/${slug}`)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Store current form data in localStorage for preview
    const previewData = {
      title,
      content,
      excerpt,
      featured_image: featuredImage,
      images,
      published,
    }
    localStorage.setItem("post-preview", JSON.stringify(previewData))
    window.open("/preview", "_blank")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{isEditing ? "Edit Post" : "Create New Post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your post"
                rows={3}
                className="text-base resize-none"
              />
            </div>

            <ImageUpload onImageAdd={handleImageAdd} onImageRemove={handleImageRemove} images={images} maxImages={10} />

            {featuredImage && (
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="text-sm text-muted-foreground">
                  The first uploaded image will be used as the featured image
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={15}
                required
                className="text-base resize-none min-h-[300px] sm:min-h-[400px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
