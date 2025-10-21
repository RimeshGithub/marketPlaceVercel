"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function ProductTabs({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (mode: string) => {
    const params = new URLSearchParams(searchParams)
    if (mode === "all") params.delete("status")
    else params.set("status", mode)
    router.push(`?${params.toString()}`)
    router.refresh()
  }

  return (
    <div className="flex gap-2 border-b mb-6">
      {["all", "available", "sold"].map((mode) => (
        <button
          key={mode}
          onClick={() => handleChange(mode)}
          className={`cursor-pointer px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            current === mode
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  )
}
