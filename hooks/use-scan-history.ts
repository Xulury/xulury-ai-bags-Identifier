'use client'

import { useSyncExternalStore } from 'react'
import { getScanHistory, subscribeToHistory } from '@/lib/scan-storage'
import type { ScanHistoryItem } from '@/lib/types'

const EMPTY: ScanHistoryItem[] = []

/**
 * Subscribes to localStorage-backed scan history with SSR-safe hydration.
 */
export function useScanHistory(): ScanHistoryItem[] {
  return useSyncExternalStore(
    subscribeToHistory,
    () => getScanHistory(),
    () => EMPTY,
  )
}
