import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Package } from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"

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
    <div className="container py-10">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-muted overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <WishlistButton productId={product.id} initialWishlisted={true} />
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">{product.title}</h3>
                </Link>
                <p className="mt-1 text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>
                {product.profiles && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Sold by {product.profiles.full_name || "Anonymous Seller"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
