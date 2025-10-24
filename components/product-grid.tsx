import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"
import { createClient } from "@/lib/supabase/server"

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  images: string[]
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export async function ProductGrid({ products }: { products: Product[] }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
  
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 max-sm:gap-3">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="overflow-hidden group hover:scale-102 h-full">
            <div className="aspect-square bg-muted overflow-hidden relative max-h-90">
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
              <div className="absolute top-2 right-2">
                <WishlistButton productId={product.id} initialWishlisted={wishlistItems?.some((item) => item.products.id === product.id) ? true : false} />
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-1">{product.title}</h3>
              <p className="mt-1 text-2xl font-bold">Rs {Number(product.price)}</p>
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
        </Link>
      ))}
    </div>
  )
}
