import type {
  BagIdentificationResult,
  ScanHistoryItem,
  ScanStatus,
} from '@/lib/types'

const STORAGE_KEY = 'luxelens.scan-history'
const RESULT_KEY = 'luxelens.last-result'

/** Lightweight pub/sub so components can react to history changes. */
type Listener = () => void
const listeners = new Set<Listener>()

// Cached snapshot so useSyncExternalStore gets a stable reference between
// reads (avoids infinite re-render loops). Invalidated on every mutation.
let cachedSnapshot: ScanHistoryItem[] | null = null

function readFromStorage(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ScanHistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function notify() {
  cachedSnapshot = null
  listeners.forEach((l) => l())
}

export function subscribeToHistory(listener: Listener): () => void {
  listeners.add(listener)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', notify)
  }
  return () => {
    listeners.delete(listener)
  }
}

export function getScanHistory(): ScanHistoryItem[] {
  if (cachedSnapshot === null) {
    cachedSnapshot = readFromStorage()
  }
  return cachedSnapshot
}

export function addScanToHistory(
  result: BagIdentificationResult,
  status: ScanStatus = 'needs-review',
): void {
  if (typeof window === 'undefined') return
  const item: ScanHistoryItem = {
    id: result.id,
    brand: result.brand,
    model: result.model,
    category: result.category,
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    currency: result.currency,
    confidence: result.confidence,
    uploadedImage: result.uploadedImage,
    status,
    createdAt: result.createdAt,
  }
  const history = getScanHistory().filter((h) => h.id !== item.id)
  history.unshift(item)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Quota exceeded (e.g. too many full-res images stored) — drop the
    // oldest entries and retry once rather than crashing the caller.
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history.slice(0, Math.max(1, Math.floor(history.length / 2)))),
      )
    } catch {
      // Still too big; give up silently, history just won't include this scan.
    }
  }
  notify()
}

export function updateScanStatus(id: string, status: ScanStatus): void {
  if (typeof window === 'undefined') return
  const history = getScanHistory().map((h) =>
    h.id === id ? { ...h, status } : h,
  )
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  notify()
}

export function clearScanHistory(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  notify()
}

/** Persist the most recent result so the result page can read it after routing. */
export function setLastResult(result: BagIdentificationResult): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RESULT_KEY, JSON.stringify(result))
  } catch {
    // Quota exceeded — clear history (the largest consumer of space, since
    // it accumulates past images) and retry once before giving up.
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.setItem(RESULT_KEY, JSON.stringify(result))
    } catch {
      // Out of options; the result page will fall back to whatever it can.
    }
  }
}

export function getLastResult(): BagIdentificationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RESULT_KEY)
    return raw ? (JSON.parse(raw) as BagIdentificationResult) : null
  } catch {
    return null
  }
}
