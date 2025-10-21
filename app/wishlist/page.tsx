import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Package } from "lucide-react"
import { ProductGrid } from "@/components/product-grid"

export default async function WishlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: wishlistItems } = await supabase
    .from("wishlist")
    .select(`
      id,
      products (
        id,
        title,
        description,
        price,
        category,
        condition,
        images,
        status,
        profiles:seller_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const products = wishlistItems?.map((item) => item.products).filter(Boolean) || []

  return (
    <div className="container pt-10 pb-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">Products you've saved for later</p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">Start adding products to your wishlist</p>
          </CardContent>
        </Card>
      ) : (
        <ProductGrid products={products || []} />
      )}
    </div>
  )
}
