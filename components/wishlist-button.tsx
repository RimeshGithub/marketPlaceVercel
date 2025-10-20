"use client"

import type React from "react"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface WishlistButtonProps {
  productId: string
  initialWishlisted?: boolean
}

export function WishlistButton({ productId, initialWishlisted = false }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (isWishlisted) {
        // Remove from wishlist
        await supabase.from("wishlist").delete().eq("product_id", productId).eq("user_id", user.id)
      } else {
        // Add to wishlist
        await supabase.from("wishlist").insert({
          product_id: productId,
          user_id: user.id,
        })
      }

      setIsWishlisted(!isWishlisted)
      router.refresh()
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className="bg-white/90 hover:bg-white hover:scale-115 border-2 border-gray-400 rounded-full"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
      />
      <span className="sr-only">{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
    </Button>
  )
}
