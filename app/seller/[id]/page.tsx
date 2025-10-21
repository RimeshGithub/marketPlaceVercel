import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ProductGrid } from "@/components/product-grid"
import { SellerRatingDisplay } from "@/components/seller-rating-display"
import { SellerReviewsDisplay } from "@/components/seller-reviews-display"
import { RatingForm } from "@/components/rating-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AutoScroll from "@/components/scroll-handler"

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: seller } = await supabase.from("profiles").select("*").eq("id", id).single()

  const { data: review } = await supabase
    .from("ratings")
    .select("*")
    .eq("seller_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!seller) {
    notFound()
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", id)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-4 flex lg:gap-10 lg:items-center max-lg:flex-col">
        <div className="flex gap-2 items-center mb-4">
          <img src={seller.avatar_url?.toString() ?? "/default.jpeg"} alt="profile" className="mr-2 h-12 w-12 rounded-full" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold mb-2">{seller.full_name || "Seller"}</h1>
            <p className="text-muted-foreground">{seller.email}</p>
          </div>
        </div>
        <div className="mb-4 flex gap-3 items-center">
          <SellerRatingDisplay sellerId={id} />
          <Button variant="outline" asChild>
            <Link href="#review-section">View Reviews</Link>
          </Button>
        </div>
      </div>

      <AutoScroll targetId="scroll-section" />

      <div className="mb-16 max-w-2xl">
        <Card>
          <CardContent className="p-6 py-0">
            <RatingForm 
              productId={products?.[0]?.id || ""} 
              sellerId={id}
              existingRating={review && {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
              }} 
            />
          </CardContent>
        </Card>
        <div id="scroll-section"></div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">All Products</h2>
        <ProductGrid products={products || []} />
      </div>

      <div className="mt-12 mb-100 pt-20" id="review-section">
        <SellerReviewsDisplay sellerId={id} />
      </div>
    </div>
  )
}
