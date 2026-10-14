import type { ScanRecord, WasteReport } from '../types'
import { generateId } from '../utils/id'

function svgThumb(label: string, accent: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'>
    <rect width='160' height='120' fill='#1a231d'/>
    <rect y='70' width='160' height='50' fill='#253029'/>
    <circle cx='40' cy='85' r='8' fill='${accent}' opacity='0.7'/>
    <circle cx='95' cy='90' r='6' fill='${accent}' opacity='0.5'/>
    <circle cx='130' cy='82' r='7' fill='${accent}' opacity='0.6'/>
    <text x='80' y='40' text-anchor='middle' fill='#F5F7F6' font-size='12' font-family='sans-serif'>${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function daysAgo(n: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, (n * 7) % 60, 0, 0)
  return d.toISOString()
}

export function createDemoScans(): ScanRecord[] {
  return [
    {
      id: generateId('scan'),
      createdAt: daysAgo(0, 14),
      filename: 'demo-clean-avenue.jpg',
      thumbnail: svgThumb('Clean', '#B7F34A'),
      cleanliness: 'clean',
      severity: 'low',
      explanation: 'Demonstration: street segment shows no visible litter; sidewalks and curbs are clear.',
      wasteCategories: [],
      confidence: null,
      recommendedAction: 'Routine monitoring. No immediate action required.',
      source: 'DEMO',
      location: 'Demo Area - Central Park Avenue',
    },
    {
      id: generateId('scan'),
      createdAt: daysAgo(1, 9),
      filename: 'demo-market-street.jpg',
      thumbnail: svgThumb('Moderate', '#F59E0B'),
      cleanliness: 'moderately_littered',
      severity: 'medium',
      explanation: 'Demonstration: scattered food packaging and one plastic bottle near a waste bin.',
      wasteCategories: [
        { name: 'plastic bottle', count: 1 },
        { name: 'food packaging', count: 2 },
      ],
      confidence: null,
      recommendedAction: 'Schedule a routine cleanup within the next 24 hours.',
      source: 'DEMO',
      location: 'Demo Area - Market Street',
    },
    {
      id: generateId('scan'),
      createdAt: daysAgo(2, 16),
      filename: 'demo-river-road.jpg',
      thumbnail: svgThumb('Heavy', '#EF4444'),
      cleanliness: 'heavily_littered',
      severity: 'high',
      explanation: 'Demonstration: significant waste accumulation including bags, bottles, and scattered debris.',
      wasteCategories: [
        { name: 'plastic bag', count: 3 },
        { name: 'plastic bottle', count: 4 },
        { name: 'food waste', count: 2 },
      ],
      confidence: null,
      recommendedAction: 'Prioritize immediate cleanup and dispatch a sanitation team.',
      source: 'DEMO',
      location: 'Demo Area - River Road',
    },
    {
      id: generateId('scan'),
      createdAt: daysAgo(3, 11),
      filename: 'demo-school-zone.jpg',
      thumbnail: svgThumb('Clean', '#B7F34A'),
      cleanliness: 'clean',
      severity: 'low',
      explanation: 'Demonstration: school zone perimeter is clean; recycling bins are available.',
      wasteCategories: [],
      confidence: null,
      recommendedAction: 'Routine monitoring. No immediate action required.',
      source: 'DEMO',
      location: 'Demo Area - School Zone North',
    },
    {
      id: generateId('scan'),
      createdAt: daysAgo(4, 15),
      filename: 'demo-bus-terminal.jpg',
      thumbnail: svgThumb('Moderate', '#F59E0B'),
      cleanliness: 'moderately_littered',
      severity: 'medium',
      explanation: 'Demonstration: litter concentrated around seating and transit shelters.',
      wasteCategories: [
        { name: 'paper cup', count: 3 },
        { name: 'cigarette butt', count: 5 },
      ],
      confidence: null,
      recommendedAction: 'Schedule a routine cleanup within the next 24 hours.',
      source: 'DEMO',
      location: 'Demo Area - Bus Terminal',
    },
    {
      id: generateId('scan'),
      createdAt: daysAgo(6, 8),
      filename: 'demo-industrial-lane.jpg',
      thumbnail: svgThumb('Heavy', '#EF4444'),
      cleanliness: 'heavily_littered',
      severity: 'high',
      explanation: 'Demonstration: construction debris and packaging material blocking the walkway.',
      wasteCategories: [
        { name: 'cardboard', count: 4 },
        { name: 'plastic wrap', count: 2 },
      ],
      confidence: null,
      recommendedAction: 'Prioritize immediate cleanup and dispatch a sanitation team.',
      source: 'DEMO',
      location: 'Demo Area - Industrial Lane',
    },
  ]
}

export function createDemoReports(scans: ScanRecord[]): WasteReport[] {
  const find = (i: number) => scans[i]
  return [
    {
      id: generateId('report'),
      scanId: find(2).id,
      scanCleanliness: find(2).cleanliness,
      location: find(2).location,
      severity: 'high',
      description: 'Heavily littered street segment with significant waste accumulation.',
      recommendedAction: 'Prioritize immediate cleanup and dispatch a sanitation team.',
      status: 'Open',
      createdAt: find(2).createdAt,
      source: 'DEMO',
    },
    {
      id: generateId('report'),
      scanId: find(5).id,
      scanCleanliness: find(5).cleanliness,
      location: find(5).location,
      severity: 'high',
      description: 'Construction debris and packaging blocking the walkway.',
      recommendedAction: 'Prioritize immediate cleanup and dispatch a sanitation team.',
      status: 'Assigned',
      createdAt: find(5).createdAt,
      source: 'DEMO',
    },
    {
      id: generateId('report'),
      scanId: find(1).id,
      scanCleanliness: find(1).cleanliness,
      location: find(1).location,
      severity: 'medium',
      description: 'Scattered food packaging and plastic bottle near waste bin.',
      recommendedAction: 'Schedule a routine cleanup within the next 24 hours.',
      status: 'In Progress',
      createdAt: find(1).createdAt,
      source: 'DEMO',
    },
    {
      id: generateId('report'),
      scanId: find(4).id,
      scanCleanliness: find(4).cleanliness,
      location: find(4).location,
      severity: 'medium',
      description: 'Litter concentrated around transit shelter seating.',
      recommendedAction: 'Schedule a routine cleanup within the next 24 hours.',
      status: 'Resolved',
      createdAt: find(4).createdAt,
      source: 'DEMO',
    },
  ]
}
