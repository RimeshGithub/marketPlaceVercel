"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SellerRatingDisplayProps {
  sellerId: string
}

export function SellerRatingDisplay({ sellerId }: SellerRatingDisplayProps) {
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [totalRatings, setTotalRatings] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchRatings = async () => {
      const { data, error } = await supabase.from("ratings").select("rating").eq("seller_id", sellerId)

      if (error) {
        console.error("Error fetching ratings:", error)
        return
      }

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
        setAverageRating(Math.round(avg * 10) / 10)
        setTotalRatings(data.length)
      }
    }

    fetchRatings()
  }, [sellerId, supabase])

  if (averageRating === null) {
    return <p className="text-sm text-muted-foreground">No ratings yet</p>
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold">{averageRating}</span>
      <span className="text-sm text-muted-foreground">({totalRatings} ratings)</span>
    </div>
  )
}
