import { createClient } from "@/lib/supabase/client"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImage(file: File, userId: string): Promise<UploadResult> {
  try {
    const supabase = createClient()

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Please upload only image files." }
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Please upload images smaller than 5MB." }
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("blog-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

export async function deleteImage(imageUrl: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split("/")
    const fileName = pathParts[pathParts.length - 1]
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage.from("blog-images").remove([filePath])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}
