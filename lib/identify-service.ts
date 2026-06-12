import type {
  BagIdentificationResult,
  FeedbackPayload,
} from '@/lib/types'

/**
 * Formats a price range like "$1,500 – $2,200".
 */
export function formatPriceRange(
  low: number,
  high: number,
  currency = 'USD',
): string {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  return `${fmt.format(low)} – ${fmt.format(high)}`
}

// A small catalogue of mock results. The first entry matches the spec.
const MOCK_RESULTS: Omit<
  BagIdentificationResult,
  'id' | 'uploadedImage' | 'createdAt'
>[] = [
  {
    brand: 'Louis Vuitton',
    model: 'Neverfull MM',
    category: 'Tote Bag',
    priceLow: 1500,
    priceHigh: 2200,
    currency: 'USD',
    confidence: 94,
    referenceImages: [
      { id: 'r1', url: '/bags/reference-1.png', caption: 'Front view' },
      { id: 'r2', url: '/bags/reference-2.png', caption: 'Interior detail' },
      { id: 'r3', url: '/bags/reference-3.png', caption: 'Handle hardware' },
      { id: 'r4', url: '/bags/reference-4.png', caption: 'Side profile' },
    ],
    alternativeMatches: [
      {
        id: 'a1',
        brand: 'Louis Vuitton',
        model: 'Neverfull GM',
        confidence: 78,
        imageUrl: '/bags/alt-1.png',
      },
      {
        id: 'a2',
        brand: 'Louis Vuitton',
        model: 'OnTheGo MM',
        confidence: 61,
        imageUrl: '/bags/alt-2.png',
      },
    ],
    sources: [
      {
        sourceName: 'Official Site',
        brand: 'Louis Vuitton',
        bagName: 'Neverfull MM Tote in Monogram Canvas',
        imageUrl: '/bags/reference-1.png',
        price: '$1,690',
        rating: null,
        url: 'https://us.louisvuitton.com/eng-us/products/neverfull-mm-monogram-canvas',
      },
      {
        sourceName: 'eBay',
        brand: 'Louis Vuitton',
        bagName: 'Louis Vuitton Neverfull MM Monogram – Authentic Pre-Owned',
        imageUrl: '/bags/reference-2.png',
        price: '$850 – $1,350',
        rating: 4.8,
        url: 'https://www.ebay.com/sch/i.html?_nkw=louis+vuitton+neverfull+mm',
      },
      {
        sourceName: 'Farfetch',
        brand: 'Louis Vuitton',
        bagName: 'Pre-owned Neverfull MM tote bag',
        imageUrl: '/bags/reference-3.png',
        price: '$950 – $1,500',
        rating: 4.6,
        url: 'https://www.farfetch.com/shopping/women/louis-vuitton/bags/items.aspx',
      },
    ],
  },
]

/**
 * Identify a handbag from a photo.
 *
 * MOCK IMPLEMENTATION — returns realistic data after a short delay.
 *
 * Future backend integration:
 *   const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const res = await fetch(`${baseUrl}/api/v1/identify`, {
    method: 'POST',
    body: form,
  })
 *   return (await res.json()) as BagIdentificationResult
 *
 * Endpoint: POST /api/v1/identify
 */
export async function identifyHandbag(
  imageFile: File,
): Promise<BagIdentificationResult> {
  const form = new FormData()
  form.append('image', imageFile)
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/_/backend' : 'http://127.0.0.1:8000')
  const res = await fetch(`${baseUrl}/api/v1/identify`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to identify handbag: ${res.statusText} ${text}`)
  }

  const result = await res.json()
  
  // Read the uploaded file as a data URL so we can preview it everywhere
  // (In a full app, the backend might return a storage URL, but this is fine for instant preview)
  const uploadedImage = await fileToDataUrl(imageFile)
  result.uploadedImage = uploadedImage

  return result as BagIdentificationResult
}

/**
 * Submit user feedback (a confirmation or a correction).
 *
 * MOCK IMPLEMENTATION — resolves after a short delay.
 *
 * Future backend integration:
 *   await fetch('/api/v1/feedback', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   })
 *
 * Endpoint: POST /api/v1/feedback
 */
export async function submitIdentificationFeedback(
  payload: FeedbackPayload,
): Promise<{ ok: true }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/_/backend' : 'http://127.0.0.1:8000')
  const res = await fetch(`${baseUrl}/api/v1/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Failed to submit feedback: ${res.statusText}`)
  }

  return { ok: true }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function createId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
