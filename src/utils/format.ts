import type { Cleanliness, Severity } from '../types'

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function formatCleanliness(value: Cleanliness): string {
  switch (value) {
    case 'clean':
      return 'Clean'
    case 'moderately_littered':
      return 'Moderately Littered'
    case 'heavily_littered':
      return 'Heavily Littered'
  }
}

export function formatSeverity(value: Severity): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function cleanlinessColor(value: Cleanliness): string {
  switch (value) {
    case 'clean':
      return 'text-[#B7F34A]'
    case 'moderately_littered':
      return 'text-amber-400'
    case 'heavily_littered':
      return 'text-red-400'
  }
}
