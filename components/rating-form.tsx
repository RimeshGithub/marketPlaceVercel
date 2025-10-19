"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface RatingFormProps {
  productId: string
  sellerId: string
  onRatingSubmitted?: () => void
  existingRating?: {
    id: string
    rating: number
    comment: string
  }
}

export function RatingForm({ productId, sellerId, onRatingSubmitted, existingRating }: RatingFormProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [comment, setComment] = useState(existingRating?.comment || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!!existingRating)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a rating",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (isEditing && existingRating) {
        const { error } = await supabase
          .from("ratings")
          .update({
            rating,
            comment: comment || null,
          })
          .eq("id", existingRating.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Rating updated successfully",
        })
      } else {
        const { error } = await supabase.from("ratings").insert({
          product_id: productId,
          seller_id: sellerId,
          buyer_id: user.id,
          rating,
          comment: comment || null,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Rating submitted successfully",
        })

        setRating(0)
        setComment("")
      }

      onRatingSubmitted?.()
    } catch (error) {
      console.log("[v0] Rating submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {isEditing ? "Update your rating" : "Rate this seller"}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-semibold mb-2 block">
          Comment (optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this seller..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-24"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Submitting..." : isEditing ? "Update Rating" : "Submit Rating"}
      </Button>
    </form>
  )
}
