"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  profile: {
    id: string
    email: string
    full_name: string | null
  }
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(profile.full_name || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ full_name: displayName }).eq("id", profile.id)

      if (error) throw error

      setMessage("Display name updated successfully!")
      setTimeout(() => window.location.reload(), 2000)
      router.refresh()
    } catch (error) {
      setMessage("Error updating display name. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is how other users will see your name on the marketplace
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("successfully") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
