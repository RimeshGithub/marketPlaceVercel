import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Package } from "lucide-react"
import { DeleteProductButton } from "@/components/delete-product-button"
import { StatusToggleButton } from "@/components/status-toggle-button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="mt-2 text-muted-foreground">Manage your product listings</p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No listings yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Create your first product listing to get started</p>
            <Button asChild className="mt-6">
              <Link href="/sell">Create Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-muted">
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
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                  <Badge variant={product.status === "available" ? "default" : "secondary"}>
                    {product.status === "available" ? "Available" : "Sold"}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>

                {product.meetup_location && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Meetup Location:</p>
                    <p>{product.meetup_location}</p>
                  </div>
                )}

                {product.payment_methods && product.payment_methods.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Payment:</p>
                    <p>{product.payment_methods.join(", ")}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <StatusToggleButton productId={product.id} currentStatus={product.status} />
                <DeleteProductButton productId={product.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
