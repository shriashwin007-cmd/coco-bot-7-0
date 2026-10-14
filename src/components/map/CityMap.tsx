import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { WasteReport, ScanRecord } from '../../types'

function divIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #0B0F0D;box-shadow:0 0 0 2px rgba(183,243,74,0.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

// Illustrative coordinates for clearly labelled demo locations.
const DEMO_COORDS: Record<string, [number, number]> = {
  'Demo Area - Central Park Avenue': [40.7829, -73.9654],
  'Demo Area - Market Street': [40.7795, -73.9632],
  'Demo Area - River Road': [40.7852, -73.9681],
  'Demo Area - School Zone North': [40.7811, -73.9615],
  'Demo Area - Bus Terminal': [40.7844, -73.9667],
  'Demo Area - Industrial Lane': [40.7873, -73.9702],
}

interface CityMapProps {
  reports: WasteReport[]
  scans: ScanRecord[]
}

export default function CityMap({ reports, scans }: CityMapProps) {
  void scans
  const [tileError, setTileError] = useState(false)

  // Illustrative waste-bin and hotspot markers
  const bins: Array<{ name: string; coord: [number, number] }> = [
    { name: 'Recycling bin #1 (illustrative)', coord: [40.782, -73.964] },
    { name: 'General waste bin #2 (illustrative)', coord: [40.786, -73.969] },
  ]
  const hotspots: Array<{ name: string; coord: [number, number]; severity: string }> = [
    { name: 'Hotspot A (illustrative)', coord: [40.7835, -73.966], severity: 'medium' },
    { name: 'Hotspot B (illustrative)', coord: [40.7858, -73.9675], severity: 'high' },
  ]

  return (
    <div className="space-y-2">
      <div className="h-72 overflow-hidden rounded-2xl border border-[#223027] md:h-96">
        {!tileError ? (
          <MapContainer center={[40.783, -73.966]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                tileerror: () => setTileError(true),
              }}
            />
            {bins.map((b, i) => (
              <Marker key={`bin-${i}`} position={b.coord} icon={divIcon('#B7F34A')}>
                <Popup>{b.name}</Popup>
              </Marker>
            ))}
            {hotspots.map((h, i) => (
              <Marker key={`hot-${i}`} position={h.coord} icon={divIcon(h.severity === 'high' ? '#EF4444' : '#F59E0B')}>
                <Popup>
                  {h.name} - severity: {h.severity}
                </Popup>
              </Marker>
            ))}
            {reports.map((r) => {
              const coord = r.location ? DEMO_COORDS[r.location] : undefined
              if (!coord) return null
              const color = r.status === 'Resolved' ? '#B7F34A' : r.severity === 'high' ? '#EF4444' : '#F59E0B'
              return (
                <Marker key={r.id} position={coord} icon={divIcon(color)}>
                  <Popup>
                    <strong>{r.id}</strong>
                    <br />
                    Location: {r.location}
                    <br />
                    Severity: {r.severity}
                    <br />
                    Status: {r.status}
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center bg-[#0F1512] p-6 text-center text-sm text-[#9CA3AF]">
            Map tiles could not be loaded. Illustrative markers are unavailable. Demo locations are listed in
            scan and report records.
          </div>
        )}
      </div>
      <p className="text-xs text-[#6B7280]">
        Illustrative demo area. Markers and locations are demonstration data only. Report markers appear only
        when a matching illustrative location is available.
      </p>
    </div>
  )
}
