"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface GoogleAuthButtonProps {
  isSignUp?: boolean
}

export function GoogleAuthButton({ isSignUp = false }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleAuth = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error("Google auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-transparent"
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      {isLoading ? "Signing in..." : `Continue with Google`}
    </Button>
  )
}
