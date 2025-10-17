"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export function MessageSellerButton({ sellerId, productId }: { sellerId: string; productId: string }) {
  const router = useRouter()

  const handleMessage = () => {
    router.push(`/messages?seller=${sellerId}&product=${productId}`)
  }

  return (
    <Button onClick={handleMessage} variant="outline">
      <MessageSquare className="h-4 w-4" />
    </Button>
  )
}
