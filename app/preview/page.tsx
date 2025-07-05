"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PreviewData {
  title: string
  content: string
  excerpt: string
  featured_image: string
  images: string[]
  published: boolean
}

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("post-preview")
    if (data) {
      setPreviewData(JSON.parse(data))
    }
  }, [])

  if (!previewData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No preview data available</p>
          <Button onClick={() => window.close()} className="mt-4">
            Close Preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.close()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
          <Badge variant="secondary">Preview Mode</Badge>
        </div>

        <article className="space-y-6">
          <header className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <User className="h-4 w-4 ml-4" />
              <span>You</span>
              {!previewData.published && (
                <Badge variant="secondary" className="ml-4">
                  Draft
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{previewData.title}</h1>

            {previewData.excerpt && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">{previewData.excerpt}</p>
            )}
          </header>

          {previewData.featured_image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={previewData.featured_image || "/placeholder.svg"}
                alt={previewData.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-base sm:text-lg">{previewData.content}</div>
          </div>

          {previewData.images && previewData.images.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewData.images.slice(1).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
