const HASH_PREFIX = '#targets='
const TARGET_COUNT = 8

export function encodeTargets(targets: number[]): string {
  return HASH_PREFIX + targets.join(',')
}

export function parseTargets(hash: string): number[] | null {
  if (!hash.startsWith(HASH_PREFIX)) return null
  const parts = hash.slice(HASH_PREFIX.length).split(',')
  if (parts.length !== TARGET_COUNT) return null
  const values: number[] = []
  for (const part of parts) {
    const n = Number(part)
    if (!Number.isFinite(n) || !Number.isInteger(n)) return null
    values.push(n)
  }
  return values
}

export function buildShareUrl(targets: number[]): string {
  return window.location.origin + window.location.pathname + encodeTargets(targets)
}

export async function copyToClipboard(text: string): Promise<'success' | 'fallback'> {
  try {
    if (!navigator.clipboard) return 'fallback'
    await navigator.clipboard.writeText(text)
    return 'success'
  } catch {
    return 'fallback'
  }
}
