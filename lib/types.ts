// Core domain types for LuxeLens. These mirror the shape the future
// FastAPI backend will return so the frontend won't need redesigning.

export interface ReferenceImage {
  id: string
  url: string
  caption: string
}

export interface AlternativeMatch {
  id: string
  brand: string
  model: string
  confidence: number // 0 - 100
  imageUrl: string
}

export interface ShoppingSource {
  sourceName: string
  brand: string
  bagName: string
  imageUrl: string
  price?: string | null
  rating?: number | null
  url: string
}

export interface BagIdentificationResult {
  id: string
  brand: string
  model: string
  /** Specific material or canvas type, e.g. "Monogram Canvas", "Togo Leather" */
  variant?: string | null
  category: string
  /** Official brand dimensions, e.g. "31 × 28 × 14 cm (12.2 × 11.0 × 5.5 in)" */
  dimensions?: string | null
  priceLow: number
  priceHigh: number
  currency: string
  confidence: number // 0 - 100
  referenceImages: ReferenceImage[]
  alternativeMatches: AlternativeMatch[]
  sources: ShoppingSource[]
  /** Data URL of the user-uploaded image, used for previews + history. */
  uploadedImage?: string
  createdAt: string // ISO timestamp
}

export type ScanStatus = 'confirmed' | 'needs-review'

export interface ScanHistoryItem {
  id: string
  brand: string
  model: string
  category: string
  priceLow: number
  priceHigh: number
  currency: string
  confidence: number
  uploadedImage?: string
  status: ScanStatus
  createdAt: string
}

export interface FeedbackPayload {
  scanId: string
  type: 'confirm' | 'correction'
  correctBrand?: string
  correctModel?: string
  note?: string
}
