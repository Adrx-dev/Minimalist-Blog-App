import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { createClient } from "@/lib/supabase/server"
import { PenTool, BookOpen } from "lucide-react"

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-6 w-6" />
              <span className="hidden sm:inline">MiniBlog</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/write" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    <span className="hidden sm:inline">Write</span>
                  </Link>
                </Button>
                <UserNav user={user} />
              </>
            ) : (
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
