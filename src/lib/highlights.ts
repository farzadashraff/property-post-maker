// A hard ceiling purely to bound loop/measureText cost on a pathological
// input (hundreds of comma-separated fragments) — well above anything that
// could ever fit vertically on the card, so the renderer's own height check
// is always what actually decides how many highlights are shown, never
// this number.
const HIGHLIGHTS_SANITY_CAP = 30

/** Splits a free-text highlights string on ·, •, |, comma, or newline. */
export function parseHighlights(raw: string): string[] {
  return raw
    .split(/[·•|,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, HIGHLIGHTS_SANITY_CAP)
}
