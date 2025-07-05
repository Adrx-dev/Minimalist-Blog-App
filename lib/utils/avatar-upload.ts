import { createClient } from "@/lib/supabase/client"

export interface AvatarUploadResult {
  success: boolean
  url?: string
  error?: string
}

// Compress and resize image before upload
export function compressImage(file: File, maxWidth = 200, quality = 0.9): Promise<File> {
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

      // Convert to blob with higher quality for better preservation
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

    // Validate file size (5MB limit before compression)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Please upload images smaller than 5MB." }
    }

    // Compress and resize image with higher quality
    const compressedFile = await compressImage(file, 400, 0.9) // Larger size and higher quality

    // Generate unique filename with timestamp to ensure uniqueness
    const timestamp = Date.now()
    const fileExt = "jpg"
    const fileName = `${userId}/avatar-${timestamp}.${fileExt}`

    // Upload new avatar (don't delete old ones immediately for backup)
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, compressedFile, {
      cacheControl: "31536000", // Cache for 1 year
      upsert: false, // Don't overwrite, create new file
    })

    if (error) {
      console.error("Upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path)

    // Update profile with new avatar URL and backup old URL
    const { data: currentProfile } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single()

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

    // Clean up old avatars (keep last 3 for backup)
    try {
      const { data: files } = await supabase.storage.from("avatars").list(userId)
      if (files && files.length > 3) {
        // Sort by created date and keep only the 3 most recent
        const sortedFiles = files
          .filter((file) => file.name.startsWith("avatar-"))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(3) // Get files to delete (all except the 3 most recent)

        if (sortedFiles.length > 0) {
          const filesToDelete = sortedFiles.map((file) => `${userId}/${file.name}`)
          await supabase.storage.from("avatars").remove(filesToDelete)
        }
      }
    } catch (cleanupError) {
      console.log("Cleanup warning:", cleanupError) // Don't fail the upload for cleanup issues
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

    // Get current avatar URL to extract filename
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single()

    if (profile?.avatar_url) {
      // Extract filename from URL
      const url = new URL(profile.avatar_url)
      const pathParts = url.pathname.split("/")
      const fileName = pathParts[pathParts.length - 1]

      // Delete from storage
      await supabase.storage.from("avatars").remove([`${userId}/${fileName}`])
    }

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

// Function to ensure avatar persistence
export async function ensureAvatarPersistence(userId: string): Promise<void> {
  try {
    const supabase = createClient()

    // Check if user has an avatar
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single()

    if (profile?.avatar_url) {
      // Verify the avatar URL is still accessible
      try {
        const response = await fetch(profile.avatar_url, { method: "HEAD" })
        if (!response.ok) {
          console.log("Avatar URL not accessible, clearing from profile")
          await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)
        }
      } catch (error) {
        console.log("Avatar verification failed:", error)
      }
    }
  } catch (error) {
    console.error("Avatar persistence check failed:", error)
  }
}
