"use client"

import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface LocationMapProps {
  latitude: number
  longitude: number
  locationName?: string
}

export function LocationMap({ latitude, longitude, locationName }: LocationMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`

  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 p-4">
        {locationName && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">{locationName}</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          className="rounded-md border"
        />
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View on OpenStreetMap
        </a>
      </div>
    </Card>
  )
}
