import { createClient } from "@/lib/supabase/client"

export interface AvatarUploadResult {
  success: boolean
  url?: string
  error?: string
}

// Compress and resize image before upload
export function compressImage(file: File, maxWidth = 200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (square crop)
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      // Set canvas size
      canvas.width = maxWidth
      canvas.height = maxWidth

      // Draw and crop image to square
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size, // Source rectangle (square crop)
        0,
        0,
        maxWidth,
        maxWidth, // Destination rectangle
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
  try {
    const supabase = createClient()

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Please upload only image files." }
    }

    // Validate file size (2MB limit before compression)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Please upload images smaller than 2MB." }
    }

    // Compress and resize image
    const compressedFile = await compressImage(file, 200, 0.8)

    // Generate filename
    const fileExt = "jpg" // Always save as JPG after compression
    const fileName = `${userId}/avatar.${fileExt}`

    // Delete existing avatar first
    await supabase.storage.from("avatars").remove([fileName])

    // Upload new avatar
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, compressedFile, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        avatar_updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return { success: false, error: "Failed to update profile" }
    }

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("Avatar upload error:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Delete from storage
    const fileName = `${userId}/avatar.jpg`
    await supabase.storage.from("avatars").remove([fileName])

    // Update profile to remove avatar URL
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Profile update error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Avatar delete error:", error)
    return false
  }
}
