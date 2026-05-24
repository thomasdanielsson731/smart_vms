import { useMemo, useState } from 'react'
import { MapPin, Crosshair, RotateCw, Bell, Navigation, Loader2 } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { MapCanvas, type FlyToTarget } from '@/components/map/MapCanvas'
import { CameraStatusBadge, SeverityBadge, IncidentStatusBadge } from '@/components/ui/StatusBadge'
import { placementFromPartial } from '@/lib/map/geo'
import { mockForensicIncidents } from '@/lib/mock-forensic'
import { alarmPinsFromIncidents, filterRecentIncidents } from '@/lib/map/alarms'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { cameraHostForIncident } from '@/lib/mock-forensic'
import { AlarmThumbnail, AlarmBestPicturePanel } from '@/components/alarm/AlarmThumbnail'

export function MapWorkspace() {
  const { cameras, mapPlacements, mapSite, setCameraMapPlacement, resetMapPlacements } =
    useAppConfig()

  const [selectedId, setSelectedId] = useState<string | null>(cameras[0]?.id ?? null)
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null)
  const [placeMode, setPlaceMode] = useState(false)
  const [showAlarms, setShowAlarms] = useState(true)
  const [alarmHours, setAlarmHours] = useState(48)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
    accuracyM?: number
  } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)

  const selected = selectedId ? mapPlacements[selectedId] : null
  const selectedCam = cameras.find((c) => c.id === selectedId)

  const recentIncidents = useMemo(
    () => filterRecentIncidents(mockForensicIncidents, alarmHours),
    [alarmHours],
  )

  const alarmPins = useMemo(
    () => alarmPinsFromIncidents(recentIncidents, mapPlacements),
    [recentIncidents, mapPlacements],
  )

  const selectedAlarm = recentIncidents.find((i) => i.id === selectedAlarmId)

  const handleMapClick = (lat: number, lng: number) => {
    if (!placeMode || !selectedId) return
    const existing = mapPlacements[selectedId]
    setCameraMapPlacement(
      placementFromPartial(selectedId, {
        lat,
        lng,
        heading: existing?.heading ?? 180,
        fovDeg: existing?.fovDeg ?? 75,
        rangeM: existing?.rangeM ?? 18,
        viewLabel: existing?.viewLabel ?? selectedCam?.location ?? '',
      }),
    )
    setPlaceMode(false)
  }

  const updateSelected = (patch: Partial<typeof selected>) => {
    if (!selectedId || !selected) return
    setCameraMapPlacement({ ...selected, ...patch, cameraId: selectedId })
  }

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('This browser does not support location services.')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        }
        setUserLocation(loc)
        setFlyTo((prev) => ({
          lat: loc.lat,
          lng: loc.lng,
          zoom: 19,
          token: (prev?.token ?? 0) + 1,
        }))
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        const messages: Record<number, string> = {
          1: 'Location permission denied. Allow location in your browser.',
          2: 'Location could not be determined.',
          3: 'Location request timed out.',
        }
        setLocationError(messages[err.code] ?? err.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  const selectAlarm = (id: string) => {
    setSelectedAlarmId(id)
    const inc = recentIncidents.find((i) => i.id === id)
    if (inc) {
      setSelectedId(inc.cameraId)
      const pin = alarmPins.find((p) => p.incident.id === id)
      if (pin) {
        setFlyTo((prev) => ({
          lat: pin.lat,
          lng: pin.lng,
          zoom: 19,
          token: (prev?.token ?? 0) + 1,
        }))
      }
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="text-sm text-slate-400">
        Map view — cameras, field of view, and alarms. Use «My location» to center the map on you.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goToMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          My location
        </button>
        <button
          type="button"
          onClick={() => setPlaceMode((p) => !p)}
          disabled={!selectedId}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
            placeMode
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Crosshair className="h-4 w-4" />
          {placeMode ? 'Click on the map…' : 'Place camera'}
        </button>
        <label className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={showAlarms}
            onChange={(e) => setShowAlarms(e.target.checked)}
            className="rounded"
          />
          <Bell className="h-4 w-4" />
          Show alarms ({alarmPins.length})
        </label>
        <select
          value={alarmHours}
          onChange={(e) => setAlarmHours(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-xs text-white"
          disabled={!showAlarms}
        >
          <option value={24}>Alarms 24 h</option>
          <option value={48}>Alarms 48 h</option>
          <option value={168}>Alarms 7 d</option>
        </select>
        {cameras.some((c) => !mapPlacements[c.id]) && (
          <span className="self-center text-xs text-amber-500">
            {cameras.filter((c) => !mapPlacements[c.id]).length} camera(s) not placed
          </span>
        )}
        <button
          type="button"
          onClick={() => resetMapPlacements()}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
        >
          Reset layout
        </button>
      </div>

      {locationError && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{locationError}</p>
      )}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[200px_1fr_240px]">
        <aside className="flex max-h-[50vh] flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 lg:max-h-none">
          <h3 className="shrink-0 border-b border-slate-800/80 px-3 py-2 text-xs font-medium uppercase text-slate-500">
            Cameras
          </h3>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1">
            {cameras.map((cam) => {
              const placed = !!mapPlacements[cam.id]
              const camAlarms = recentIncidents.filter((i) => i.cameraId === cam.id).length
              return (
                <li key={cam.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(cam.id)
                      setSelectedAlarmId(null)
                    }}
                    className={`mb-1 w-full rounded-lg px-2 py-2 text-left text-sm ${
                      selectedId === cam.id && !selectedAlarmId
                        ? 'bg-blue-600/20 text-blue-200'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <MapPin
                          className={`h-3.5 w-3.5 ${placed ? 'text-emerald-400' : 'text-slate-600'}`}
                        />
                        {cam.name}
                      </span>
                      {showAlarms && camAlarms > 0 && (
                        <span className="rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-400">
                          {camAlarms}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {showAlarms && (
            <>
              <h3 className="shrink-0 border-t border-b border-slate-800/80 px-3 py-2 text-xs font-medium uppercase text-slate-500">
                Alarms on map
              </h3>
              <ul className="max-h-40 min-h-0 overflow-y-auto p-1">
                {alarmPins.length === 0 && (
                  <li className="px-2 py-2 text-xs text-slate-600">No alarms in period.</li>
                )}
                {alarmPins.map(({ incident }) => (
                  <li key={incident.id}>
                    <button
                      type="button"
                      onClick={() => selectAlarm(incident.id)}
                      className={`mb-1 flex w-full gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                        selectedAlarmId === incident.id
                          ? 'bg-amber-500/15 text-amber-200'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <AlarmThumbnail
                        incident={incident}
                        cameraHost={cameraHostForIncident(incident, cameras)}
                        size="sm"
                        showBbox={false}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block">{incident.title}</span>
                        <span className="text-[10px] text-slate-600">
                          {formatRelativeTime(incident.occurredAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-xl border border-slate-800/80">
          <MapCanvas
            site={mapSite}
            cameras={cameras}
            placements={mapPlacements}
            alarmPins={alarmPins}
            showAlarms={showAlarms}
            selectedCameraId={selectedId}
            selectedAlarmId={selectedAlarmId}
            placeMode={placeMode}
            userLocation={userLocation}
            flyTo={flyTo}
            onMapClick={handleMapClick}
            onMarkerDrag={(id, lat, lng) => {
              const p = mapPlacements[id]
              if (p) setCameraMapPlacement({ ...p, lat, lng })
            }}
            onSelectCamera={(id) => {
              setSelectedId(id)
              setSelectedAlarmId(null)
            }}
            onSelectAlarm={selectAlarm}
          />
          <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] text-slate-400">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-400" /> low
            <span className="mx-2 inline-block h-2 w-2 rounded-full bg-amber-400" /> medium
            <span className="mx-2 inline-block h-2 w-2 rounded-full bg-red-500" /> high
            <span className="mx-2 inline-block h-2 w-2 rounded-full bg-blue-500" /> my location
          </div>
        </div>

        <aside className="overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          {selectedAlarm ? (
            <div className="space-y-3">
              <AlarmBestPicturePanel
                incident={selectedAlarm}
                cameraHost={cameraHostForIncident(selectedAlarm, cameras)}
              />
              <h3 className="font-semibold text-white">{selectedAlarm.title}</h3>
              <p className="text-xs text-slate-500">{selectedAlarm.cameraName}</p>
              <div className="flex flex-wrap gap-1.5">
                <SeverityBadge severity={selectedAlarm.severity} />
                <IncidentStatusBadge status={selectedAlarm.status} />
              </div>
              <p className="text-xs text-slate-400">{formatDateTime(selectedAlarm.occurredAt)}</p>
              {selectedAlarm.ruleName && (
                <p className="text-xs text-slate-500">Rule: {selectedAlarm.ruleName}</p>
              )}
              <p className="text-xs text-slate-600">
                Plotted in the camera field of view. Open video timeline for clips.
              </p>
            </div>
          ) : selectedCam && selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">{selectedCam.name}</h3>
                <p className="text-xs text-slate-500">{selectedCam.location}</p>
                <div className="mt-2">
                  <CameraStatusBadge status={selectedCam.status} />
                </div>
              </div>

              <Field label="View / direction (description)">
                <input
                  value={selected.viewLabel}
                  onChange={(e) => updateSelected({ viewLabel: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Facing garage door"
                />
              </Field>

              <Field label={`Bearing ${selected.heading}° (0=north)`}>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={selected.heading}
                  onChange={(e) => updateSelected({ heading: Number(e.target.value) })}
                  className="w-full"
                />
              </Field>

              <Field label={`Field of view ${selected.fovDeg}°`}>
                <input
                  type="range"
                  min={20}
                  max={120}
                  value={selected.fovDeg}
                  onChange={(e) => updateSelected({ fovDeg: Number(e.target.value) })}
                  className="w-full"
                />
              </Field>

              <Field label={`Range ${selected.rangeM} m`}>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={selected.rangeM}
                  onChange={(e) => updateSelected({ rangeM: Number(e.target.value) })}
                  className="w-full"
                />
              </Field>

              <p className="text-xs text-slate-500">
                <RotateCw className="mr-1 inline h-3 w-3" />
                Lat {selected.lat.toFixed(5)}, lng {selected.lng.toFixed(5)}
              </p>
            </div>
          ) : selectedCam ? (
            <div className="text-sm text-slate-400">
              <p className="mb-3 font-medium text-white">{selectedCam.name}</p>
              <p>Not placed. Choose «Place camera» and click on the map.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a camera or alarm</p>
          )}
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-white'
