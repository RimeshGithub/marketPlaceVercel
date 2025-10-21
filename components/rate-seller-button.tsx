"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export default function RateSellerButton({ sellerId }: { sellerId: string }) {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push(`/seller/${sellerId}`)}
      variant="outline"
    >
      <Star className="h-4 w-4 mr-0.5" />
      Rate Seller
    </Button>
  )
}
