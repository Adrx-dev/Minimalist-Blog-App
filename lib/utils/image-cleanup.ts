import { createClient } from "@/lib/supabase/client"

export async function cleanupUnusedImages(userId: string, usedImageUrls: string[]) {
  try {
    const supabase = createClient()

    // List all images for the user
    const { data: files, error } = await supabase.storage.from("blog-images").list(userId)

    if (error || !files) {
      console.error("Error listing files:", error)
      return
    }

    // Find unused images
    const unusedFiles = files.filter((file) => {
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images/${userId}/${file.name}`
      return !usedImageUrls.includes(fileUrl)
    })

    // Delete unused images
    if (unusedFiles.length > 0) {
      const filePaths = unusedFiles.map((file) => `${userId}/${file.name}`)
      const { error: deleteError } = await supabase.storage.from("blog-images").remove(filePaths)

      if (deleteError) {
        console.error("Error deleting unused files:", deleteError)
      } else {
        console.log(`Cleaned up ${unusedFiles.length} unused images`)
      }
    }
  } catch (error) {
    console.error("Cleanup error:", error)
  }
}
