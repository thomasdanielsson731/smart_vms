import { LeafletMapCanvas, type LeafletMapCanvasProps } from '@/components/map/LeafletMapCanvas'

export type { FlyToTarget } from '@/components/map/map-types'
export type MapCanvasProps = LeafletMapCanvasProps

export function MapCanvas(props: LeafletMapCanvasProps) {
  return <LeafletMapCanvas {...props} />
}
