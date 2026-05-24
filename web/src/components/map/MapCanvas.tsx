import { isGoogleMapsEnabled } from '@/lib/map/google-maps-config'
import { GoogleMapCanvas } from '@/components/map/GoogleMapCanvas'
import { LeafletMapCanvas, type LeafletMapCanvasProps } from '@/components/map/LeafletMapCanvas'

export type { FlyToTarget } from '@/components/map/map-types'
export type MapCanvasProps = LeafletMapCanvasProps

export function MapCanvas(props: LeafletMapCanvasProps) {
  if (isGoogleMapsEnabled()) {
    return <GoogleMapCanvas {...props} />
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-2">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
        Using OpenStreetMap (no Google Maps API key). Add{' '}
        <code className="text-amber-100">VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
        <code className="text-amber-100">web/.env</code> and restart{' '}
        <code className="text-amber-100">npm run dev</code> for Google Maps.
      </div>
      <div className="min-h-0 flex-1">
        <LeafletMapCanvas {...props} />
      </div>
    </div>
  )
}
