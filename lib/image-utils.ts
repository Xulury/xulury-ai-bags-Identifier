/**
 * Downscales an image File to a max dimension via canvas, re-encoding it as
 * JPEG. Camera captures (especially on mobile) can be 10-20MB at full
 * sensor resolution, which is unnecessary for identification and is large
 * enough to blow past the ~5-10MB localStorage quota when base64-encoded —
 * that quota overflow is what crashed the result page after a camera shot.
 * Re-encoding through canvas also normalizes EXIF orientation, so
 * camera photos shot in portrait/rotated orientations don't end up sideways.
 */
export async function downscaleImage(
  file: File,
  maxDimension = 1600,
  quality = 0.85,
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    // If the browser can't decode/re-encode (unsupported format, etc.),
    // fall back to the original file rather than blocking the user.
    return file
  }
}
