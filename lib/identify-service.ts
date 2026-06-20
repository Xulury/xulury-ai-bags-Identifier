import type {
  AlternativeMatch,
  BagIdentificationResult,
  FeedbackPayload,
  ShoppingSource,
} from '@/lib/types'

function apiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '/_/backend' : 'http://127.0.0.1:8000')
  )
}

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

  const baseUrl = apiBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180_000) // 3 min hard timeout
  let res: Response
  try {
    res = await fetch(`${baseUrl}/api/v1/identify`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Identification timed out. Please try again on a faster connection.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    const text = await res.text()
    if (res.status === 400) {
      let detail = 'This image does not appear to contain a handbag.'
      try { detail = JSON.parse(text).detail || detail } catch {}
      throw new Error(`NOT_A_BAG:${detail}`)
    }
    throw new Error(`Failed to identify handbag: ${res.statusText} ${text}`)
  }

  const result = await res.json()

  // Read the uploaded file as a data URL so we can preview it everywhere
  // instantly — the backend doesn't need to round-trip the photo back to us.
  result.uploadedImage = await fileToDataUrl(imageFile)

  return result as BagIdentificationResult
}

/**
 * Fetches alternative matches + shopping sources for an already-identified
 * bag. This is deliberately a separate, lightweight (text-only, no image)
 * call so the result page can render the core identification immediately
 * and load this part in the background instead of making the user wait on it.
 *
 * Endpoint: POST /api/v1/identify/{scanId}/extras
 */
export async function fetchIdentificationExtras(
  result: Pick<BagIdentificationResult, 'id' | 'brand' | 'model' | 'variant' | 'category'>,
  uploadedImage?: string,
): Promise<{ alternativeMatches: AlternativeMatch[]; sources: ShoppingSource[] }> {
  const baseUrl = apiBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/identify/${result.id}/extras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand: result.brand,
      model: result.model,
      variant: result.variant,
      category: result.category,
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch sources and similar matches: ${res.statusText}`)
  }

  const extras = await res.json()

  // "Where to find it" sources use the bag's own photo rather than a
  // separately fetched product image.
  const sources: ShoppingSource[] = Array.isArray(extras.sources)
    ? extras.sources.map((s: ShoppingSource) => ({
        ...s,
        imageUrl: uploadedImage || s.imageUrl,
      }))
    : []

  return {
    alternativeMatches: Array.isArray(extras.alternativeMatches) ? extras.alternativeMatches : [],
    sources,
  }
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
  const baseUrl = apiBaseUrl()
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
