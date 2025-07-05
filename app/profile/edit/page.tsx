import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProfileEditForm user={user} profile={profile} />
    </div>
  )
}
