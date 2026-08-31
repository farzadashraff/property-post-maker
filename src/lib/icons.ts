/**
 * Small vector icons drawn directly with Canvas 2D paths — deliberately not
 * emoji or a font glyph. Emoji rendering depends on the OS/browser having a
 * color-emoji font installed (verified missing in at least one real test
 * environment during QA), so anything load-bearing for the design is drawn
 * as a path instead, guaranteeing identical output everywhere.
 */

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawPinIcon(ctx: CanvasRenderingContext2D, cx: number, topY: number, size: number, color: string) {
  const r = size * 0.34
  const headCy = topY + r

  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, headCy, r, Math.PI, 0, false)
  ctx.quadraticCurveTo(cx + r, headCy + r * 1.7, cx, headCy + r * 3.3)
  ctx.quadraticCurveTo(cx - r, headCy + r * 1.7, cx - r, headCy)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, headCy, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** A simple mobile-phone glyph: unambiguous at small size, no curve to misread. */
export function drawPhoneIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  backgroundColor: string,
) {
  const w = size * 0.56
  const h = size
  const x = cx - w / 2
  const y = cy - h / 2

  ctx.save()
  ctx.fillStyle = color
  roundRectPath(ctx, x, y, w, h, w * 0.3)
  ctx.fill()

  // Screen cutout — an inset rect matching whatever the icon sits on top
  // of, so it reads as a phone screen without a transparency mode.
  ctx.fillStyle = backgroundColor
  roundRectPath(ctx, x + w * 0.12, y + h * 0.14, w * 0.76, h * 0.62, w * 0.12)
  ctx.fill()

  ctx.fillStyle = color
  roundRectPath(ctx, cx - w * 0.16, y + h * 0.86, w * 0.32, h * 0.05, h * 0.02)
  ctx.fill()
  ctx.restore()
}
