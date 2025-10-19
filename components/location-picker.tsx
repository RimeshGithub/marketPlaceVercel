"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Loader2, X, Navigation } from "lucide-react"

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
  const [mode, setMode] = useState<"search" | "enter">("search")
  const [manualLocation, setManualLocation] = useState(value)
  const [isGeolocating, setIsGeolocating] = useState(false)

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
    setManualLocation(result.display_name)
    setSearchInput(result.display_name)
    setSearchResults([])
    onChange(result.display_name, lat, lng)
  }

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Reverse geocode to get location name
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          const data = await response.json()
          const locationName = data.address?.city || data.address?.town || data.display_name || "Current Location"

          setSelectedLocation(locationName)
          setSelectedLat(lat)
          setSelectedLng(lng)
          setManualLocation(locationName)
          setSearchInput(locationName)
          onChange(locationName, lat, lng)
        } catch (error) {
          console.error("Error reverse geocoding:", error)
          setSelectedLocation("Current Location")
          setSelectedLat(lat)
          setSelectedLng(lng)
          setManualLocation("Current Location")
          setSearchInput("Current Location")
          onChange("Current Location", lat, lng)
        } finally {
          setIsGeolocating(false)
        }
      },
      () => {
        alert("Unable to retrieve your location")
        setIsGeolocating(false)
      },
    )
  }

  const handleEnterLocation = () => {
    if (!manualLocation.trim()) return

    setSelectedLocation(manualLocation)
    setSelectedLat(0)
    setSelectedLng(0)
    onChange(manualLocation, 0, 0)
  }

  const clearLocation = () => {
    setSelectedLocation("")
    setSearchInput("")
    setSearchResults([])
    setManualLocation("")
  }

  return (
    <div className="space-y-3">
      {/* Mode Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "search"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Search Location
        </button>
        <button
          type="button"
          onClick={() => setMode("enter")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "enter"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Enter Location
        </button>
      </div>

      {/* Search Mode */}
      {mode === "search" && (
        <div className="space-y-3">
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

          {/* Current Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGeolocating}
            className="w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGeolocating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Use Current Location
              </>
            )}
          </button>

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
        </div>
      )}

      {/* Enter Location Mode */}
      {mode === "enter" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Enter Location</label>
            <textarea
              placeholder="Type your preferred meetup location (e.g., 'Coffee shop near Central Park, New York' or 'Main Street, Downtown')"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onBlur={handleEnterLocation}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none"
              rows={3}
            />
          </div>
        </div>
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

      <p className="text-xs text-muted-foreground">
        Choose a location by searching, using your current location, or entering a location description
      </p>
    </div>
  )
}
