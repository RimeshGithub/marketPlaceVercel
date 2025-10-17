'use client'

import dynamic from 'next/dynamic'

// Load the map dynamically on the client
const LocationMap = dynamic(
  () => import('@/components/location-map').then(mod => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    )
  }
)

export default function MapWrapper({ latitude, longitude }: { lat: number; lng: number }) {
  return <LocationMap latitude={latitude} longitude={longitude} />
}
