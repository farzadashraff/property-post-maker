/** Turns a property title into a safe, meaningful download filename. */
export function buildDownloadFilename(propertyType: string): string {
  const safeName = propertyType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${safeName || 'property-post'}.png`
}
