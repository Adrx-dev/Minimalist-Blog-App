"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, PenTool, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserNavProps {
  user: SupabaseUser
}

interface Profile {
  avatar_url: string | null
  full_name: string | null
}

export function UserNav({ user }: UserNavProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single()

      if (data) {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user.id, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email?.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm hover:ring-primary/20 transition-all">
            <AvatarImage
              src={profile?.avatar_url || "/placeholder.svg"}
              alt={displayName || "User avatar"}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {displayName && <p className="font-medium">{displayName}</p>}
            <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/write")}>
          <PenTool className="mr-2 h-4 w-4" />
          Write Post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile/edit")}>
          <Settings className="mr-2 h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
