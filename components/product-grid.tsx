import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Link from "next/link"

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

export function ProductGrid({ products }: { products: Product[] }) {
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden group">
          <Link href={`/products/${product.id}`}>
            <div className="aspect-square bg-muted overflow-hidden">
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
  )
}
