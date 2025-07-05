import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>There was an issue confirming your email address or signing you in.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This could happen if:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>The confirmation link has expired</li>
                <li>The link has already been used</li>
                <li>There was a network error</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
