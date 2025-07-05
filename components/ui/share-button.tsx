"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import clsx from "clsx"

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  iconOnly?: boolean
  className?: string
}

export function ShareButton({ title, text, url = window?.location.href, iconOnly, className }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className={clsx(className)} title="Share">
      <Share2 className="h-4 w-4" />
      {!iconOnly && <span className="ml-2">Share</span>}
    </Button>
  )
}
