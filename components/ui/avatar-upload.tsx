"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, Trash2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadAvatar, deleteAvatar } from "@/lib/utils/avatar-upload"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userName?: string
  userId: string
  onAvatarUpdate: (newAvatarUrl: string | null) => void
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
}

export function AvatarUpload({ currentAvatarUrl, userName, userId, onAvatarUpdate, size = "xl" }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setIsUploading(true)

    try {
      const result = await uploadAvatar(file, userId)

      if (result.success && result.url) {
        onAvatarUpdate(result.url)
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        })
        // Clear preview since we have the real URL now
        setPreviewUrl(null)
        URL.revokeObjectURL(preview)
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload profile picture",
          variant: "destructive",
        })
        setPreviewUrl(null)
        URL.revokeObjectURL(preview)
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Something went wrong while uploading",
        variant: "destructive",
      })
      setPreviewUrl(null)
      URL.revokeObjectURL(preview)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAvatar = async () => {
    setIsUploading(true)
    try {
      const success = await deleteAvatar(userId)

      if (success) {
        onAvatarUpdate(null)
        toast({
          title: "Success",
          description: "Profile picture removed successfully!",
        })
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to remove profile picture",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Something went wrong while removing the picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl
  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar
          className={`${sizeClasses[size]} ring-2 ring-background shadow-lg transition-all duration-200 group-hover:ring-primary/20`}
        >
          <AvatarImage
            src={displayUrl || "/placeholder.svg"}
            alt={userName || "User avatar"}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Loading overlay */}
        {isUploading && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/50 flex items-center justify-center`}
          >
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Camera overlay on hover */}
        {!isUploading && size === "xl" && (
          <div
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {size === "xl" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-transparent"
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {currentAvatarUrl ? "Change" : "Upload"}
          </Button>

          {currentAvatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAvatar}
              disabled={isUploading}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {size === "xl" && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Upload a square image for best results. Max 2MB. JPG, PNG, GIF, or WebP.
        </p>
      )}
    </div>
  )
}
