// Virtual COCO BOT simulation. Every value here is SIMULATED for demonstration
// of the proposed hardware concept. Nothing reads or controls real devices.

import type { VirtualBotState } from '../types'

const KEY = 'cocobot_virtual_bot_v1'

function rand(min: number, max: number, decimals = 1): number {
  const v = min + Math.random() * (max - min)
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

export function initialBotState(): VirtualBotState {
  return {
    soilMoisture: 46,
    temperature: 27.5,
    humidity: 62,
    plantHealth: 'Monitoring — no hardware attached',
    solarPower: 'Charging (simulated)',
    solarWatts: 18.4,
    connectivity: 'Wi-Fi linked (simulated)',
    antifungalPump: 'OFF',
    nutrientPump: 'OFF',
    lastCycle: null,
  }
}

export function loadBotState(): VirtualBotState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialBotState()
    const parsed = JSON.parse(raw) as VirtualBotState
    if (typeof parsed.soilMoisture !== 'number') return initialBotState()
    return parsed
  } catch {
    return initialBotState()
  }
}

export function saveBotState(state: VirtualBotState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

/** Run one simulated monitoring cycle and return the new state + log lines. */
export function runMonitoringCycle(prev: VirtualBotState): { state: VirtualBotState; log: string[] } {
  const soilMoisture = rand(28, 72)
  const temperature = rand(24, 34)
  const humidity = rand(45, 85)
  const solarWatts = rand(8, 32)
  const log: string[] = []
  log.push(`Soil moisture sampled (simulated): ${soilMoisture}%`)
  log.push(`Air temperature sampled (simulated): ${temperature}°C`)
  log.push(`Humidity sampled (simulated): ${humidity}%`)
  log.push(`Solar input simulated at ${solarWatts} W — battery charging`)

  let plantHealth = 'Canopy looks stable (simulated)'
  if (soilMoisture < 35) plantHealth = 'Soil dry — irrigation suggested (simulated)'
  else if (humidity > 78 && temperature > 29) plantHealth = 'Warm + humid — fungal-risk watch (simulated)'

  const antifungalPump: VirtualBotState['antifungalPump'] =
    humidity > 78 && temperature > 29 ? 'ON' : 'OFF'
  const nutrientPump: VirtualBotState['nutrientPump'] = soilMoisture < 35 ? 'ON' : 'OFF'
  if (antifungalPump === 'ON') log.push('Antifungal pump state → ON (simulated, timed dose)')
  else log.push('Antifungal pump stays OFF (simulated)')
  if (nutrientPump === 'ON') log.push('Nutrient pump state → ON (simulated, timed dose)')
  else log.push('Nutrient pump stays OFF (simulated)')
  log.push('Cycle complete. No real hardware was contacted.')

  const state: VirtualBotState = {
    soilMoisture,
    temperature,
    humidity,
    plantHealth,
    solarPower: solarWatts > 12 ? 'Charging (simulated)' : 'Low light (simulated)',
    solarWatts,
    connectivity: Math.random() < 0.85 ? 'Wi-Fi linked (simulated)' : 'LoRa fallback (simulated)',
    antifungalPump,
    nutrientPump,
    lastCycle: new Date().toLocaleString(),
  }
  saveBotState(state)
  return { state, log }
}
