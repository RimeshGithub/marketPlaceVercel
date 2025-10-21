"use client"
import { useState } from "react"
import { Package } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"

export default function ProductImages({ product, isWishlisted }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted relative">
        {product.images.length > 0 ? (
            <img
              src={images[currentIndex]}
              alt={product.title}
              className="h-full w-full object-cover transition-all duration-500"
            />
          )
          : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )
        }
        <div className="absolute top-4 right-4">
          <WishlistButton productId={product.id} initialWishlisted={isWishlisted} />
        </div>

        {/* Dot navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`cursor-pointer h-4 w-4 max-md:h-3 max-md:w-3 rounded-full transition-all border ${
                  currentIndex === index ? "bg-white scale-150" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
