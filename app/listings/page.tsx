import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Package } from "lucide-react"
import ProductTabs from "@/components/product-filter-tabs"

export default async function DashboardPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // 🧠 Read the current status tab from URL
  const status = JSON.parse(JSON.stringify(await searchParams)).status

  // 🧩 Build query dynamically
  let query = supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = status === "sold" ? query.eq("status", "sold") : query.eq("status", "available")
  }

  const { data: products } = await query

  return (
    <div className="container pt-10 pb-30">
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

      {/* 🧭 Tabs for switching filter */}
      <ProductTabs current={status || "all"} />

      {!products || products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try a different status or create a new listing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 max-sm:gap-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="overflow-hidden hover:scale-102 h-full">
                <div className="aspect-square bg-muted overflow-hidden max-h-90">
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
                  <div className="flex items-start justify-between mb-4 max-sm:flex-col max-sm:gap-2">
                    <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                    <Badge variant={product.status === "available" ? "default" : "secondary"}>
                      {product.status === "available" ? "Available" : "Sold"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-2xl font-bold">Rs {Number(product.price)}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
