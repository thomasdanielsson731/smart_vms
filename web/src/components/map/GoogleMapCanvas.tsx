import { useEffect, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Polygon,
  Circle,
  type MapCameraChangedEvent,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps'
import type { Camera } from '@/types/camera'
import { severityToColor } from '@/lib/map/alarms'
import { fovWedgeCoords } from '@/lib/map/geo'
import { googleMapsApiKey, googleMapsMapId } from '@/lib/map/google-maps-config'
import type { LeafletMapCanvasProps } from '@/components/map/LeafletMapCanvas'

const statusColor: Record<Camera['status'], string> = {
  online: '#22c55e',
  offline: '#ef4444',
  degraded: '#f59e0b',
  unknown: '#94a3b8',
}

function GoogleMapLayers({
  cameras,
  placements,
  alarmPins,
  showAlarms,
  selectedCameraId,
  selectedAlarmId,
  userLocation,
  flyTo,
  placeMode,
  onMapClick,
  onMarkerDrag,
  onSelectCamera,
  onSelectAlarm,
  site,
}: LeafletMapCanvasProps) {
  const [center, setCenter] = useState({ lat: site.centerLat, lng: site.centerLng })
  const [zoom, setZoom] = useState(site.defaultZoom)

  useEffect(() => {
    setCenter({ lat: site.centerLat, lng: site.centerLng })
    setZoom(site.defaultZoom)
  }, [site.centerLat, site.centerLng, site.defaultZoom])

  useEffect(() => {
    if (!flyTo) return
    setCenter({ lat: flyTo.lat, lng: flyTo.lng })
    if (flyTo.zoom != null) setZoom(flyTo.zoom)
  }, [flyTo])

  const handleClick = (e: MapMouseEvent) => {
    if (!placeMode || !e.detail.latLng) return
    onMapClick(e.detail.latLng.lat, e.detail.latLng.lng)
  }

  const handleCameraChanged = (e: MapCameraChangedEvent) => {
    setCenter(e.detail.center)
    setZoom(e.detail.zoom)
  }

  return (
    <Map
      center={center}
      zoom={zoom}
      mapId={googleMapsMapId}
      gestureHandling="greedy"
      disableDefaultUI={false}
      onClick={handleClick}
      onCameraChanged={handleCameraChanged}
      className={`h-full min-h-[320px] w-full rounded-xl ${placeMode ? 'cursor-crosshair' : ''}`}
      style={{ width: '100%', height: '100%' }}
    >

      {cameras.map((cam) => {
        const p = placements[cam.id]
        if (!p) return null
        const color = statusColor[cam.status]
        const selected = cam.id === selectedCameraId
        const wedgePath = fovWedgeCoords(p.lat, p.lng, p.heading, p.fovDeg, p.rangeM).map(
          ([lat, lng]) => ({ lat, lng }),
        )

        return (
          <div key={cam.id}>
            <Polygon
              paths={wedgePath}
              strokeColor={color}
              strokeWeight={selected ? 2 : 1}
              fillColor={color}
              fillOpacity={selected ? 0.35 : 0.2}
              clickable={false}
            />
            <AdvancedMarker
              position={{ lat: p.lat, lng: p.lng }}
              draggable
              onClick={() => onSelectCamera(cam.id)}
              onDragEnd={(e) => {
                const pos = e.latLng
                if (pos) onMarkerDrag(cam.id, pos.lat(), pos.lng())
              }}
              title={`${cam.name}: ${p.viewLabel || 'View'}`}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: color,
                  border: `2px solid ${selected ? '#60a5fa' : '#fff'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: '#0f1419',
                  fontWeight: 700,
                }}
              >
                {cam.name.charAt(0)}
              </div>
            </AdvancedMarker>
          </div>
        )
      })}

      {showAlarms &&
        alarmPins.map((pin) => {
          const { incident } = pin
          const color = severityToColor(incident.severity)
          const selected = incident.id === selectedAlarmId
          const isOpen = incident.status === 'open'
          const size = selected ? 22 : 18

          return (
            <AdvancedMarker
              key={incident.id}
              position={{ lat: pin.lat, lng: pin.lng }}
              onClick={() => onSelectAlarm(incident.id)}
              title={incident.title}
              zIndex={500}
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: color,
                  border: `2px solid ${selected ? '#fff' : 'rgba(255,255,255,.7)'}`,
                  boxShadow: isOpen
                    ? '0 0 0 3px rgba(239,68,68,.45)'
                    : '0 2px 6px rgba(0,0,0,.4)',
                }}
              />
            </AdvancedMarker>
          )
        })}

      {userLocation && (
        <>
          {userLocation.accuracyM != null && userLocation.accuracyM > 0 && (
            <Circle
              center={{ lat: userLocation.lat, lng: userLocation.lng }}
              radius={userLocation.accuracyM}
              strokeColor="#3b82f6"
              strokeWeight={1}
              fillColor="#3b82f6"
              fillOpacity={0.12}
            />
          )}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title="My location"
            zIndex={1000}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#3b82f6',
                border: '3px solid #fff',
                boxShadow: '0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,.4)',
              }}
            />
          </AdvancedMarker>
        </>
      )}
    </Map>
  )
}

export function GoogleMapCanvas(props: LeafletMapCanvasProps) {
  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="relative h-full min-h-[320px] w-full">
        <GoogleMapLayers {...props} />
        <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-slate-300">
          Google Maps
        </div>
      </div>
    </APIProvider>
  )
}
