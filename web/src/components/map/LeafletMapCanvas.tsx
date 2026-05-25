import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Camera } from '@/types/camera'
import type { CameraMapPlacement, MapSiteSettings } from '@/types/map'
import type { MapAlarmPin } from '@/lib/map/alarms'
import { severityToColor } from '@/lib/map/alarms'
import { fovWedgeCoords } from '@/lib/map/geo'
import type { FitBoundsTarget, FlyToTarget } from '@/components/map/map-types'

const statusColor: Record<Camera['status'], string> = {
  online: '#22c55e',
  offline: '#ef4444',
  degraded: '#f59e0b',
  unknown: '#94a3b8',
}

export interface LeafletMapCanvasProps {
  site: MapSiteSettings
  cameras: Camera[]
  placements: Record<string, CameraMapPlacement>
  alarmPins: MapAlarmPin[]
  showAlarms: boolean
  selectedCameraId: string | null
  selectedAlarmId: string | null
  placeMode: boolean
  userLocation: { lat: number; lng: number; accuracyM?: number } | null
  flyTo: FlyToTarget | null
  fitBounds: FitBoundsTarget | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerDrag: (cameraId: string, lat: number, lng: number) => void
  onSelectCamera: (cameraId: string) => void
  onSelectAlarm: (incidentId: string) => void
}

export function LeafletMapCanvas({
  site,
  cameras,
  placements,
  alarmPins,
  showAlarms,
  selectedCameraId,
  selectedAlarmId,
  placeMode,
  userLocation,
  flyTo,
  fitBounds,
  onMapClick,
  onMarkerDrag,
  onSelectCamera,
  onSelectAlarm,
}: LeafletMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const cameraLayersRef = useRef<L.LayerGroup | null>(null)
  const alarmLayersRef = useRef<L.LayerGroup | null>(null)
  const userLayerRef = useRef<L.LayerGroup | null>(null)
  const placeModeRef = useRef(placeMode)
  const onMapClickRef = useRef(onMapClick)

  useEffect(() => {
    placeModeRef.current = placeMode
    onMapClickRef.current = onMapClick
  }, [placeMode, onMapClick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [site.centerLat, site.centerLng],
      zoom: site.defaultZoom,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 21,
    }).addTo(map)

    cameraLayersRef.current = L.layerGroup().addTo(map)
    alarmLayersRef.current = L.layerGroup().addTo(map)
    userLayerRef.current = L.layerGroup().addTo(map)

    map.on('click', (e) => {
      if (placeModeRef.current) onMapClickRef.current(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    requestAnimationFrame(() => map.invalidateSize({ animate: false }))

    return () => {
      map.remove()
      mapRef.current = null
      cameraLayersRef.current = null
      alarmLayersRef.current = null
      userLayerRef.current = null
    }
    // Init once — site changes are applied via setView below (avoid remount / view snap-back).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([site.centerLat, site.centerLng], site.defaultZoom, { animate: false })
    map.invalidateSize({ animate: false })
  }, [site.centerLat, site.centerLng, site.defaultZoom])

  useEffect(() => {
    if (!flyTo || !mapRef.current) return
    mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 18, { duration: 0.8 })
  }, [flyTo])

  useEffect(() => {
    if (!fitBounds?.points.length || !mapRef.current) return
    const bounds = L.latLngBounds(fitBounds.points.map((p) => [p.lat, p.lng] as [number, number]))
    mapRef.current.fitBounds(bounds, {
      padding: [fitBounds.padding ?? 48, fitBounds.padding ?? 48],
      maxZoom: fitBounds.maxZoom ?? 19,
      animate: true,
      duration: 0.8,
    })
  }, [fitBounds])

  useEffect(() => {
    const map = mapRef.current
    const container = containerRef.current
    if (!map || !container) return

    const refreshSize = () => {
      map.invalidateSize({ animate: false })
    }

    refreshSize()
    const observer = new ResizeObserver(refreshSize)
    observer.observe(container)
    const parent = container.parentElement
    if (parent) observer.observe(parent)

    return () => observer.disconnect()
  }, [placeMode, site.centerLat, site.centerLng, site.defaultZoom])

  useEffect(() => {
    const group = cameraLayersRef.current
    if (!group) return
    group.clearLayers()

    for (const cam of cameras) {
      const p = placements[cam.id]
      if (!p) continue

      const color = statusColor[cam.status]
      const selected = cam.id === selectedCameraId

      const wedge = L.polygon(fovWedgeCoords(p.lat, p.lng, p.heading, p.fovDeg, p.rangeM), {
        color,
        fillColor: color,
        fillOpacity: selected ? 0.35 : 0.2,
        weight: selected ? 2 : 1,
        interactive: !placeMode,
      })
      wedge.bindTooltip(`${cam.name}: ${p.viewLabel || 'View'}`, { sticky: true })
      wedge.addTo(group)

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};border:2px solid ${selected ? '#60a5fa' : '#fff'};
          box-shadow:0 2px 8px rgba(0,0,0,.4);
          display:flex;align-items:center;justify-content:center;
          font-size:14px;color:#0f1419;font-weight:700;
        ">${cam.name.charAt(0)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([p.lat, p.lng], {
        icon,
        draggable: !placeMode,
        interactive: !placeMode,
      })
      marker.on('click', () => onSelectCamera(cam.id))
      marker.on('dragend', () => {
        const ll = marker.getLatLng()
        onMarkerDrag(cam.id, ll.lat, ll.lng)
      })
      marker.bindPopup(
        `<strong>${cam.name}</strong><br/>${p.viewLabel}<br/><small>${p.heading}° · ${p.fovDeg}° FOV</small>`,
      )
      marker.addTo(group)
    }
  }, [cameras, placements, selectedCameraId, placeMode, onMarkerDrag, onSelectCamera])

  useEffect(() => {
    const group = alarmLayersRef.current
    if (!group) return
    group.clearLayers()

    if (!showAlarms) return

    for (const pin of alarmPins) {
      const { incident } = pin
      const color = severityToColor(incident.severity)
      const selected = incident.id === selectedAlarmId
      const isOpen = incident.status === 'open'

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${selected ? 22 : 18}px;height:${selected ? 22 : 18}px;
          border-radius:50%;
          background:${color};
          border:2px solid ${selected ? '#fff' : 'rgba(255,255,255,.7)'};
          box-shadow:0 0 ${isOpen ? '0 0 0 3px rgba(239,68,68,.45)' : '0 2px 6px rgba(0,0,0,.4)'};
        "></div>`,
        iconSize: [selected ? 22 : 18, selected ? 22 : 18],
        iconAnchor: [selected ? 11 : 9, selected ? 11 : 9],
      })

      const marker = L.marker([pin.lat, pin.lng], { icon, zIndexOffset: 500, interactive: !placeMode })
      marker.on('click', () => onSelectAlarm(incident.id))
      const time = new Date(incident.occurredAt).toLocaleString('en-US')
      marker.bindPopup(
        `<strong>${incident.title}</strong><br/>
        ${incident.cameraName}<br/>
        <small>${time} · ${incident.status}</small>`,
      )
      marker.bindTooltip(incident.title, { direction: 'top' })
      marker.addTo(group)
    }
  }, [alarmPins, showAlarms, selectedAlarmId, placeMode, onSelectAlarm])

  useEffect(() => {
    const group = userLayerRef.current
    if (!group) return
    group.clearLayers()

    if (!userLocation) return

    if (userLocation.accuracyM && userLocation.accuracyM > 0) {
      L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracyM,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1,
        interactive: !placeMode,
      }).addTo(group)
    }

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:16px;height:16px;border-radius:50%;
        background:#3b82f6;border:3px solid #fff;
        box-shadow:0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,.4);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    L.marker([userLocation.lat, userLocation.lng], { icon, zIndexOffset: 1000, interactive: !placeMode })
      .bindTooltip('My location', { direction: 'top', permanent: false })
      .addTo(group)
  }, [userLocation, placeMode])

  return (
    <div
      className={`relative h-full min-h-[280px] w-full ${placeMode ? 'cursor-crosshair' : ''}`}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 rounded-xl" />
    </div>
  )
}
