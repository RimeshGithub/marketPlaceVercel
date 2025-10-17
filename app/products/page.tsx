import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("products")
    .select(`
      *,
      profiles:seller_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "active")

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.condition) {
    query = query.eq("condition", params.condition)
  }

  if (params.minPrice) {
    query = query.gte("price", Number.parseFloat(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number.parseFloat(params.maxPrice))
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
        <p className="mt-2 text-muted-foreground">Discover great deals from sellers around the world</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <ProductFilters />
        </aside>

        <main>
          <ProductGrid products={products || []} />
        </main>
      </div>
    </div>
  )
}
