"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckSquare } from "lucide-react"

interface StatusToggleButtonProps {
  productId: string
  currentStatus: string
}

export function StatusToggleButton({ productId, currentStatus }: StatusToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const newStatus = currentStatus === "available" ? "sold" : "available"

      const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", productId)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleToggleStatus}
      disabled={isLoading}
      className="flex-1"
    > 
      <CheckSquare className="mr-0.5 h-4 w-4" />
      {isLoading ? (
        <>
          Updating...
        </>
      ) : currentStatus === "available" ? (
        "Mark Sold"
      ) : (
        "Mark Available"
      )}
    </Button>
  )
}
