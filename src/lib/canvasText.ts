/**
 * Generic Canvas 2D text/shape helpers. No branding or business logic lives
 * here — these are reusable primitives the post renderer composes.
 */

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | { tl: number; tr: number; br: number; bl: number },
) {
  const rad = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r
  ctx.beginPath()
  ctx.moveTo(x + rad.tl, y)
  ctx.lineTo(x + w - rad.tr, y)
  ctx.arcTo(x + w, y, x + w, y + rad.tr, rad.tr)
  ctx.lineTo(x + w, y + h - rad.br)
  ctx.arcTo(x + w, y + h, x + w - rad.br, y + h, rad.br)
  ctx.lineTo(x + rad.bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - rad.bl, rad.bl)
  ctx.lineTo(x, y + rad.tl)
  ctx.arcTo(x, y, x + rad.tl, y, rad.tl)
  ctx.closePath()
}

/** Code-point-safe: trims `text` one character at a time until `text…` fits. */
function trimToFitWithEllipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const chars = Array.from(text)
  let result = ''
  for (const ch of chars) {
    const candidate = `${result}${ch}…`
    if (ctx.measureText(candidate).width > maxWidth) break
    result += ch
  }
  return result ? `${result}…` : '…'
}

/** Returns `text` unchanged if it already fits; otherwise ellipsizes it. */
export function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  return trimToFitWithEllipsis(ctx, text, maxWidth)
}

/**
 * Guarantees a visible "…" is appended, unlike `ellipsize` (whose "already
 * fits" short-circuit is checked against the bare text — the wrong check
 * once a caller has already decided some content was cut and truncation
 * WILL happen regardless, e.g. wrapText's last line: the line itself may
 * fit, but appending "…" can push it just over, and re-running ellipsize's
 * own fits-check on the un-suffixed text would wrongly skip trimming).
 */
function truncateWithEllipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const withEllipsis = `${text}…`
  if (ctx.measureText(withEllipsis).width <= maxWidth) return withEllipsis
  return trimToFitWithEllipsis(ctx, text, maxWidth)
}

/**
 * Wraps text to at most `maxLines`, ellipsizing the final line if the text
 * doesn't fit. Returns the y-coordinate immediately below the drawn text.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  let overflow = false

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (!current || ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      lines.push(current)
      current = word
      if (lines.length === maxLines) {
        overflow = true
        break
      }
    }
  }
  if (!overflow && current) lines.push(current)

  if (overflow) {
    lines[maxLines - 1] = truncateWithEllipsis(ctx, lines[maxLines - 1], maxWidth)
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight)
  })

  return y + lines.length * lineHeight
}

/** Finds the largest font size (down to `minSize`) that fits `text` within `maxWidth`. */
export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  fontFamily: string,
  maxSize: number,
  minSize: number,
): number {
  let size = maxSize
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${fontFamily}`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}
