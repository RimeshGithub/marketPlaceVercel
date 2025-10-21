"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

interface AutoScrollProps {
  targetId: string
}

export default function AutoScroll({ targetId }: AutoScrollProps) {
  const searchParams = useSearchParams()
  const condition = searchParams.get("allProducts")
  const hasScrolled = useRef(false)

  useEffect(() => {
    if (condition && !hasScrolled.current) {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        hasScrolled.current = true // prevent repeated scrolling
      }
    }
  }, [condition, targetId])

  return null // no UI needed
}
