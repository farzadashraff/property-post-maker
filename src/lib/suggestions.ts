function normalize(s: string): string {
  return s.toLowerCase().replace(/[₹,\s]/g, '')
}

/**
 * Case/currency/whitespace-insensitive filter, capped to `limit` results.
 * Prefix matches rank first (typing "B" should surface Bengaluru/Bangalore/
 * Bhopal before Mumbai or Hyderabad, even though those also contain a "b"),
 * with substring matches filling any remaining slots after.
 */
export function filterSuggestions(dataset: readonly string[], query: string, limit = 8): string[] {
  const q = normalize(query)
  if (!q) return []

  const startsWithMatches: string[] = []
  const containsMatches: string[] = []
  for (const item of dataset) {
    const normalized = normalize(item)
    if (normalized.startsWith(q)) {
      startsWithMatches.push(item)
    } else if (normalized.includes(q)) {
      containsMatches.push(item)
    }
  }

  return [...startsWithMatches, ...containsMatches].slice(0, limit)
}
