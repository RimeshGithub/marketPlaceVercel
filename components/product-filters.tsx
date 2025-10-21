"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import { useState } from "react"

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Books & Media",
  "Automotive",
  "Other",
]

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "All categories")
  const [condition, setCondition] = useState(searchParams.get("condition") || "All conditions")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (category !== "All categories") params.set("category", category)
    if (condition !== "All conditions") params.set("condition", condition)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("All categories")
    setCondition("All conditions")
    setMinPrice("")
    setMaxPrice("")
    router.push("/products")
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("condition") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice")

  return (
    <div className="flex gap-3 max-xl:flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 -mt-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search by Keywords</Label>
            <div className="flex gap-2 max-sm:flex-col">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="pl-9"
                />
              </div>
              <Button onClick={applyFilters}>
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 -mt-3 flex gap-5 max-lg:flex-col">
          <div className="flex gap-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All categories">All categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All conditions">All conditions</SelectItem>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="1"
                className="w-40"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="1"
                className="w-40"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters}>
              Apply
            </Button>
            {hasFilters && (
              <Button onClick={clearFilters} variant="outline" size="icon">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
