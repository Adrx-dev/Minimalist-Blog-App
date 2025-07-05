import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { createClient } from "@/lib/supabase/server"
import { PenTool, BookOpen, Sparkles } from "lucide-react"

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
              <div className="relative">
                <BookOpen className="h-7 w-7 text-transparent bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="hidden sm:inline gradient-text">MiniBlog</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                >
                  <Link href="/write" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-pink-500" />
                    <span className="hidden sm:inline gradient-text font-medium">Write</span>
                  </Link>
                </Button>
                <UserNav user={user} />
              </>
            ) : (
              <Button
                asChild
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
