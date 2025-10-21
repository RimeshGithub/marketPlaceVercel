import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Mail, Settings } from "lucide-react"
import { MessageSellerButton } from "@/components/message-seller-button"
import Link from "next/link"
import { StatusToggleButton } from "@/components/status-toggle-button"
import { DeleteProductButton } from "@/components/delete-product-button"
import { SellerRatingDisplay } from "@/components/seller-rating-display"
import LocationMap from "@/components/map-wrapper"
import ProductImages from "@/components/image-gallery"
import RateSellerButton from "@/components/rate-seller-button"

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

  const { data: seller } = await supabase.from("profiles").select("*").eq("id", product.seller_id).single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isWishlisted = false
  if (user) {
    const { data: wishlistItem } = await supabase
      .from("wishlist")
      .select("id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .maybeSingle()
    isWishlisted = !!wishlistItem
  }

  const isOwnProduct = user?.id === product.seller_id

  let hasRated = false
  if (user) {
    const { data: existingRating } = await supabase
      .from("ratings")
      .select("id")
      .eq("product_id", id)
      .eq("buyer_id", user.id)
      .maybeSingle()
    hasRated = !!existingRating
  }

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: "Cash on Delivery",
    online_banking: "Online Banking",
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] mb-8">
        {/* Image Gallery */}
        <ProductImages product={product} isWishlisted={isWishlisted} />

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-center px-4">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
              <Badge variant={product.status === "available" ? "default" : "secondary"}>
                {product.status === "available" ? "Available" : "Sold"}
              </Badge>
            </div>
            <p className="mt-2 text-4xl font-bold text-primary">Rs {Number(product.price)}</p>
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
        </div>     
      </div>

      <Separator />

      <div className="grid items-center mx-auto gap-8 max-w-2xl my-8">
        <Card className="space-y-3 px-4">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Preferred Meetup Location</p>
              <p className="text-muted-foreground">{product.meetup_location}</p>
            </div>
          </div>

          {product.latitude !== 0 && product.longitude !== 0 && (
            <div className="-mt-5">
              <LocationMap latitude={product.latitude} longitude={product.longitude} />
            </div>
          )}
        </Card>

        {/* Seller Info */}
        <Card>
          <CardContent className="px-6 space-y-4">
            <h3 className="font-semibold">Seller Information</h3>

            <div className="flex gap-2 items-center mb-4">
              <img src={seller.avatar_url?.toString() ?? "/default.jpeg"} alt="profile" className="h-9 w-9 rounded-full" />
              <h1 className="text-xl font-bold mb-2">{seller.full_name || "Seller"}</h1>
            </div>
            <div>
              <SellerRatingDisplay sellerId={product.seller_id} />
            </div>

            {product.seller_phone && (
              <Link href={`tel:${product.seller_phone}`}>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{product.seller_phone}</span>
                </div>
              </Link>
            )}

            {product.seller_email && (
              <Link href={`mailto:${product.seller_email}`}>
                <div className="flex items-center gap-2 text-sm py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{product.seller_email}</span>
                </div>
              </Link>
            )}

            <div className="flex gap-2 mt-3">
              {!isOwnProduct && product.status === "available" && (
                <div className="flex gap-3">
                  {user ? (
                    <MessageSellerButton sellerId={product.seller_id} productId={product.id} />
                  ) : (
                    <Button asChild className="flex-1">
                      <Link href="/auth/login">Login to Contact Seller</Link>
                    </Button>
                  )}
                </div>
              )}
              {!isOwnProduct && <RateSellerButton sellerId={product.seller_id} />}
            </div>

            {!isOwnProduct && <Button asChild variant="outline" className="w-full mt-2 bg-transparent">
              <Link href={`/seller/${product.seller_id}?allProducts=true`}>View all products</Link>
            </Button>}
          </CardContent>
        </Card>

        {!isOwnProduct && product.status === "sold" && (
          <Card className="bg-muted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">This item has been sold</p>
            </CardContent>
          </Card>
        )}

        {isOwnProduct && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="px-4 flex flex-col gap-2 items-center">
              <p className="text-sm text-muted-foreground">This is your listing</p>
              <div className="flex gap-2 mt-2">
                <StatusToggleButton productId={product.id} currentStatus={product.status} />
                <DeleteProductButton productId={product.id} />
              </div>
              <Button asChild className="w-full" variant="ghost">
                <Link href="/listings"><Settings className="mr-0.5 h-4 w-4" />Manage Listings</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
