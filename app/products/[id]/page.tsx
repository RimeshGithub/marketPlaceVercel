import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, MapPin, Phone, Mail } from "lucide-react"
import { MessageSellerButton } from "@/components/message-seller-button"
import Link from "next/link"
import dynamic from "next/dynamic"

const LocationMap = dynamic(() => import("@/components/location-map").then((mod) => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>,
})

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      profiles:seller_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (!product) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProduct = user?.id === product.seller_id

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: "Cash on Delivery",
    online_banking: "Online Banking",
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.title} ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
              <Badge variant={product.status === "available" ? "default" : "secondary"}>
                {product.status === "available" ? "Available" : "Sold"}
              </Badge>
            </div>
            <p className="mt-2 text-4xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.condition}</Badge>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Preferred Meetup Location</p>
                <p className="text-muted-foreground">{product.meetup_location}</p>
              </div>
            </div>

            {product.latitude && product.longitude && (
              <div className="mt-4">
                <LocationMap latitude={product.latitude} longitude={product.longitude} />
              </div>
            )}
          </div>

          <Separator />

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Seller Information</h3>
              <p className="text-sm text-muted-foreground">{product.profiles?.full_name || "Anonymous Seller"}</p>

              {product.seller_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{product.seller_phone}</span>
                </div>
              )}

              {product.seller_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{product.seller_email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isOwnProduct && product.status === "available" && (
            <div className="flex gap-3">
              {user ? (
                <MessageSellerButton sellerId={product.seller_id} productId={product.id} className="flex-1" />
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/auth/login">Login to Contact Seller</Link>
                </Button>
              )}
            </div>
          )}

          {!isOwnProduct && product.status === "sold" && (
            <Card className="bg-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">This item has been sold</p>
              </CardContent>
            </Card>
          )}

          {isOwnProduct && (
            <Card className="bg-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">This is your listing</p>
                <Button asChild variant="outline" className="mt-3 w-full bg-transparent">
                  <Link href="/dashboard">Manage Listing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
