import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Package, ShieldCheck, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get featured products
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      profiles:seller_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "available").neq("seller_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(15)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      {!user && (
        <>
          <section className="relative py-20">
            <div className="container">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">Buy and Sell with Confidence</h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                  Join thousands of buyers and sellers in our trusted marketplace. Find great deals or turn your items into
                  cash.
                </p>
                <div className="mt-10 flex items-center justify-center gap-4">
                  <Button size="lg" asChild>
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/sell">Start Selling</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="container">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Our Marketplace</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Everything you need for a seamless buying and selling experience
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 justify-center">
                <Card>
                  <CardContent>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Easy Discovery</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Find exactly what you&apos;re looking for with powerful search and filters
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Secure Payments</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Shop with confidence using our secure payment system
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Direct Messaging</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect with sellers instantly to ask questions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Quick Listing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      List your items in minutes with our simple process
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
                  <p className="mt-4 text-lg text-primary-foreground/90">Join our community of buyers and sellers today</p>
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/auth/sign-up">Create Account</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                      asChild
                    >
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* Featured Products */}
      {user && products && products.length > 0 && (
        <section className="pt-10 pb-30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <Button variant="outline" asChild>
                <Link href="/products">View All</Link>
              </Button>
            </div>

            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:scale-102 h-full">
                    <div className="aspect-square bg-muted max-h-75">
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
                      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                      <p className="mt-1 text-2xl font-bold">Rs {Number(product.price)}</p>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">{product.category}</Badge>
                        <Badge variant="outline">{product.condition}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
