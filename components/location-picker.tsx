"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Loader2, X } from "lucide-react"

interface LocationResult {
  lat: string
  lon: string
  display_name: string
}

interface LocationPickerProps {
  value: string
  latitude: number
  longitude: number
  onChange: (location: string, lat: number, lng: number) => void
}

export function LocationPicker({ value, latitude, longitude, onChange }: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState(value)
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(value)
  const [selectedLat, setSelectedLat] = useState(latitude)
  const [selectedLng, setSelectedLng] = useState(longitude)

  const handleSearch = async () => {
    if (!searchInput.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5`,
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching location:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectLocation = (result: LocationResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    setSelectedLocation(result.display_name)
    setSelectedLat(lat)
    setSelectedLng(lng)
    setSearchInput(result.display_name)
    setSearchResults([])
    onChange(result.display_name, lat, lng)
  }

  const clearLocation = () => {
    setSelectedLocation("")
    setSearchInput("")
    setSearchResults([])
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-2">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectLocation(result)}
                className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors text-sm"
              >
                <div className="font-medium text-foreground">{result.display_name.split(",")[0]}</div>
                <div className="text-xs text-muted-foreground truncate">{result.display_name}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="font-medium text-sm">{selectedLocation}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Coordinates: {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedLat}&mlon=${selectedLng}&zoom=15`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                View on OpenStreetMap →
              </a>
            </div>
            <button type="button" onClick={clearLocation} className="p-1 hover:bg-muted rounded transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="rounded overflow-hidden bg-muted border border-border">
            <iframe
              width="100%"
              height="200"
              frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedLng - 0.01).toFixed(4)},${(selectedLat - 0.01).toFixed(4)},${(selectedLng + 0.01).toFixed(4)},${(selectedLat + 0.01).toFixed(4)}&layer=mapnik&marker=${selectedLat.toFixed(4)},${selectedLng.toFixed(4)}`}
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">Search for a location to set your preferred meetup point</p>
    </div>
  )
}
