import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError) {
      // Get the current user session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        // Extract avatar URL from Google OAuth metadata
        const avatarUrl = user.user_metadata?.avatar_url

        if (avatarUrl) {
          // Update the profile with the avatar URL
          await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
        }
      }
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}
