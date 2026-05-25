export interface FlyToTarget {
  lat: number
  lng: number
  zoom?: number
  /** Increment to trigger flyTo again */
  token: number
}

export interface FitBoundsTarget {
  points: { lat: number; lng: number }[]
  padding?: number
  maxZoom?: number
  token: number
}

export type MapCanvasProps = import('@/components/map/LeafletMapCanvas').LeafletMapCanvasProps
