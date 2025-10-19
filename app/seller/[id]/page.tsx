import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Link from "next/link"
import { SellerRatingDisplay } from "@/components/seller-rating-display"
import { SellerReviewsDisplay } from "@/components/seller-reviews-display"
import { RatingForm } from "@/components/rating-form"

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: seller } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!seller) {
    notFound()
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{seller.full_name || "Seller"}</h1>
        <div className="mb-4">
          <SellerRatingDisplay sellerId={id} />
        </div>
        <p className="text-muted-foreground">{seller.email}</p>
      </div>

      <div className="mb-12 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <RatingForm productId={id} sellerId={id} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">All Products</h2>
        {products && products.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-muted relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
                    <p className="text-2xl font-bold text-primary mb-3">${Number(product.price).toFixed(2)}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant="outline">{product.condition}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products available</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12">
        <SellerReviewsDisplay sellerId={id} />
      </div>
    </div>
  )
}
