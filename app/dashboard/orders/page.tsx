import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package } from "lucide-react"

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get orders where user is buyer
  const { data: purchases } = await supabase
    .from("orders")
    .select(`
      *,
      products (*),
      profiles:seller_id (full_name, email)
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  // Get orders where user is seller
  const { data: sales } = await supabase
    .from("orders")
    .select(`
      *,
      products (*),
      profiles:buyer_id (full_name, email)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">View your purchases and sales</p>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          {!purchases || purchases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No purchases yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your purchase history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purchases.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.products?.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Seller: {order.profiles?.full_name || order.profiles?.email}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{order.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold">${Number(order.total_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          {!sales || sales.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No sales yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your sales history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sales.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.products?.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Buyer: {order.profiles?.full_name || order.profiles?.email}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{order.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold">${Number(order.total_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Shipping Address:</span>
                        <p className="mt-1">{order.shipping_address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
