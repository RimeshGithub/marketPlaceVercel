"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Upload, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LocationPicker } from "@/components/location-picker"

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

export function ProductForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    meetupLocation: "",
    latitude: 40.7128,
    longitude: -74.006,
    sellerPhone: "",
    sellerEmail: "",
    paymentMethods: [] as string[],
    bankName: "",
    bankAccountNumber: "",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      setError("You can only upload up to 5 images")
      return
    }

    setImages([...images, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }))
  }

  const handleLocationChange = (location: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      meetupLocation: location,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (formData.paymentMethods.length === 0) {
        throw new Error("Please select at least one payment method")
      }

      if (!formData.category) {
        throw new Error("Please select a category")
      }

      if(!formData.condition) {
        throw new Error("Please select a condition")
      }

      if(images.length === 0) {
        throw new Error("Please upload at least one image")
      }

      if (formData.paymentMethods.includes("online_banking")) {
        if (!formData.bankName || !formData.bankAccountNumber) {
          throw new Error("Bank name and account number are required for online banking")
        }
      }

      if (!formData.meetupLocation.trim()) {
        throw new Error("Please specify a preferred meetup location")
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create a listing")
      }

      // Upload images to Vercel Blob
      const imageUrls: string[] = []
      for (const image of images) {
        const formDataObj = new FormData()
        formDataObj.append("file", image)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataObj,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        imageUrls.push(data.url)
      }

      const { error: insertError } = await supabase.from("products").insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        meetup_location: formData.meetupLocation,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: imageUrls,
        status: "available",
        seller_phone: formData.sellerPhone || null,
        seller_email: formData.sellerEmail || null,
        payment_methods: formData.paymentMethods,
        bank_name: formData.bankName || null,
        bank_account_number: formData.bankAccountNumber || null,
      })

      if (insertError) throw insertError

      router.push("/listings")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your product..."
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs)</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                required
                value={formData.price}
                onWheel={e => e.target.blur()}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Details (Optional)</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.sellerPhone}
                  onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.sellerEmail}
                  onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash"
                  checked={formData.paymentMethods.includes("cash_on_delivery")}
                  onCheckedChange={() => handlePaymentMethodChange("cash_on_delivery")}
                />
                <Label htmlFor="cash" className="font-normal cursor-pointer">
                  Cash on Delivery
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="banking"
                  checked={formData.paymentMethods.includes("online_banking")}
                  onCheckedChange={() => handlePaymentMethodChange("online_banking")}
                />
                <Label htmlFor="banking" className="font-normal cursor-pointer">
                  Online Banking
                </Label>
              </div>
            </div>

            {formData.paymentMethods.includes("online_banking") && (
              <div className="mt-4 p-4 border border-muted rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Your bank name"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Your bank account number"
                    required
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Images (upto 5)</Label>
            <div className="grid gap-4">
              {imagePreviews.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border bg-muted overflow-hidden">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload images</p>
                      <p className="text-xs text-muted-foreground">({images.length}/5 uploaded)</p>
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetup">Preferred Meetup Location</Label>
            <LocationPicker
              value={formData.meetupLocation}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
            />
          </div>

          {error && <div className="rounded-lg bg-destructive/30 border-red-500 border p-4 text-sm text-red-500">{error}</div>}

          <div className="flex gap-4 mt-10">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
