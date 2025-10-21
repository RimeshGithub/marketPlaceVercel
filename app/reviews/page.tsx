"use client"

import { useEffect, useState } from "react"
import { Star, MessageCircle, Edit2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { SellerRatingDisplay } from "@/components/seller-rating-display"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  buyer_id: string
}

interface Reviewer {
  id: string
  full_name: string
  avatar_url: string
}

interface SellerReviewsDisplayProps {
  sellerId: string
}

export default function SellerReviewsDisplay() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewer, setReviewer] = useState<Reviewer[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reviews:", error)
        setLoading(false)
        return
      }

      setReviews(data || [])

      const { data: reviewerInfo, error: reviewerError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      setReviewer(reviewerInfo?.map((r) => ({ id: r.id, full_name: r.full_name, avatar_url: r.avatar_url })) || [])

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const { error } = await supabase.from("ratings").delete().eq("id", reviewId)

      if (error) throw error

      setReviews(reviews.filter((r) => r.id !== reviewId))
      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  if (reviews.length === 0) {
    return (
        <div className="py-10">
            <Card>
                <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
            </Card>
        </div> 
    )
  }

  return (
    <div className="space-y-4 pt-10 pb-30">
        <Card className="flex gap-2 items-center mb-10">
            <h3 className="text-xl font-bold">Overall Rating: </h3>
            <SellerRatingDisplay sellerId={currentUserId} />
        </Card>
        <h3 className="text-xl font-bold">Customer Reviews ({reviews.length})</h3>
        {reviews.map((review) => (
            <Card key={review.id}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                <div className="flex gap-2 items-center mb-4">
                    <img src={reviewer?.find((r) => r.id === review.buyer_id)?.avatar_url?.toString() ?? "/default.jpeg"} alt="profile" className="mr-2 h-12 w-12 rounded-full" />
                    <div className="flex flex-col gap-1">
                    <h1 className="text-lg font-bold">{reviewer?.find((r) => r.id === review.buyer_id)?.full_name || "Anonymous"}</h1>
                    <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                        />
                        ))}
                    </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                </div>
                </div>
                {review.comment && <p className="text-foreground">{review.comment}</p>}
            </CardContent>
            </Card>
        ))}
    </div>
  )
}
