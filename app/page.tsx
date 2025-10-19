import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShieldCheck, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

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
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
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

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
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
              <CardContent className="pt-6">
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
              <CardContent className="pt-6">
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
              <CardContent className="pt-6">
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

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <Button variant="outline" asChild>
                <Link href="/products">View All</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-muted">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Search className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold line-clamp-1 hover:text-primary">{product.title}</h3>
                    </Link>
                    <p className="mt-1 text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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
    </div>
  )
}
