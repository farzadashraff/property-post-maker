// A hard ceiling purely to bound loop/measureText cost on a pathological
// input (hundreds of comma-separated fragments, or every checkbox selected
// at once) — well above anything that could ever fit vertically on the
// card, so the renderer's own height check is always what actually decides
// how many highlights are shown, never this number.
export const HIGHLIGHTS_SANITY_CAP = 40

// Same reasoning as MAX_FIELD_LEN in postRenderer.ts: a generous ceiling
// well above the input's own maxLength, purely to bound a scripted/pasted
// pathological string — the HTML maxLength isn't a real security boundary
// (bypassable via direct value assignment), so this is the actual guard.
const MAX_RAW_LEN = 2000

/** Splits a free-text highlights string on ·, •, |, comma, or newline. */
export function parseHighlights(raw: string): string[] {
  return raw
    .slice(0, MAX_RAW_LEN)
    .split(/[·•|,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Combines free-typed highlights with checkbox-selected ones, removing
 * duplicates case-insensitively (typed text wins the exact casing shown,
 * since it appears first) while preserving each side's original order.
 */
export function mergeHighlights(typed: string[], selected: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of [...typed, ...selected]) {
    const trimmed = item.trim()
    const key = trimmed.toLowerCase()
    if (!trimmed || seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result.slice(0, HIGHLIGHTS_SANITY_CAP)
}
