"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Edit, Package, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export function UserMenu({ user }: { user: SupabaseUser }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

      if (data?.full_name) {
        setDisplayName(data.full_name)
      }
    }

    fetchProfile()
  }, [user.id])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-0.5">
          <img src={user.user_metadata.avatar_url?.toString() ?? "/default.jpeg"} alt="profile" className="mr-2 h-8 w-8 rounded-full" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{displayName || user.user_metadata.full_name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/listings")}>
          <Package className="mr-0.5 h-4 w-4" />
          My Listings
        </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/reviews")}>
          <Star className="mr-0.5 h-4 w-4" />
          My Reviews
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <Edit className="mr-0.5 h-4 w-4" />
          Change Name
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-0.5 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
