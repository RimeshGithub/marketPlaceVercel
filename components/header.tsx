import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Package, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "./user-menu"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="px-10 max-md:py-5 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex max-md:flex-col max-md:gap-4 items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Marketplace</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Browse
            </Link>
            <Link href="/sell" className="text-sm font-medium transition-colors hover:text-primary">
              Sell
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/messages">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Messages</span>
                </Link>
              </Button>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
