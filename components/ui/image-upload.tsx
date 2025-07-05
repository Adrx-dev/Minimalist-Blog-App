"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { uploadImage, deleteImage } from "@/lib/utils/image-upload"
import Image from "next/image"

interface ImageUploadProps {
  onImageAdd: (imageUrl: string, altText?: string, caption?: string) => void
  onImageRemove: (imageUrl: string) => void
  images: string[]
  maxImages?: number
}

export function ImageUpload({ onImageAdd, onImageRemove, images, maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images per post.`,
        variant: "destructive",
      })
      return
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileId = `${file.name}-${Date.now()}`
        setUploadingFiles((prev) => new Set([...prev, fileId]))

        try {
          const result = await uploadImage(file, user.id)

          if (result.success && result.url) {
            onImageAdd(result.url, file.name)
            return { success: true, fileName: file.name }
          } else {
            toast({
              title: "Upload failed",
              description: result.error || `Failed to upload ${file.name}`,
              variant: "destructive",
            })
            return { success: false, fileName: file.name }
          }
        } finally {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev)
            newSet.delete(fileId)
            return newSet
          })
        }
      })

      const results = await Promise.all(uploadPromises)
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        toast({
          title: "Upload successful",
          description: `${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully.`,
        })
      }

      if (failCount > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failCount} image${failCount > 1 ? "s" : ""} failed to upload.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageRemove = async (imageUrl: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && imageUrl.includes("supabase")) {
      // Only try to delete if it's a Supabase Storage URL
      await deleteImage(imageUrl, user.id)
    }

    onImageRemove(imageUrl)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Images (Optional)</Label>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isUploading ? "Uploading images..." : "Drag and drop images here, or click to select files"}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 5MB each (max {maxImages} images)</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || images.length >= maxImages}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageRemove(imageUrl)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <div className="text-sm text-muted-foreground">
          Uploading {uploadingFiles.size} file{uploadingFiles.size > 1 ? "s" : ""}...
        </div>
      )}
    </div>
  )
}
