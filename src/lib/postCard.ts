export interface PostData {
  propertyType: string
  location: string
  price: string
  highlights: string
}

export const BRAND = {
  name: 'Farzad',
  tagline: 'Property Post Maker',
  contact: '+91 9605005511',
  monogram: 'F',
}

export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350

const INK = '#111827'
const SLATE = '#4b5563'
const LIGHT_BORDER = '#e5e7eb'
const CHIP_BG = '#f3f4f6'
const ACCENT = '#d4a24e'

function roundRectPath(
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

function wrapText(
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
    lines[maxLines - 1] = ellipsize(ctx, lines[maxLines - 1], maxWidth)
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight)
  })

  return y + lines.length * lineHeight
}

function drawPinIcon(ctx: CanvasRenderingContext2D, cx: number, topY: number, size: number, color: string) {
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

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  const chars = Array.from(text)
  let result = ''
  for (const ch of chars) {
    const candidate = `${result}${ch}…`
    if (ctx.measureText(candidate).width > maxWidth) break
    result += ch
  }
  return result ? `${result}…` : '…'
}

function splitHighlights(raw: string): string[] {
  return raw
    .split(/[·•|,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function drawChips(
  ctx: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
): number {
  const paddingX = 22
  const paddingY = 16
  const gap = 14
  const lineGap = 16
  const fontSize = 27
  ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`

  let cursorX = x
  let cursorY = y
  const chipHeight = fontSize + paddingY * 2

  const dotGap = 14
  const dotR = 6

  const maxTextWidth = maxWidth - paddingX * 2 - dotR * 2 - dotGap

  for (const rawItem of items) {
    const item = ellipsize(ctx, rawItem, maxTextWidth)
    const textWidth = ctx.measureText(item).width
    const chipWidth = textWidth + paddingX * 2 + dotR * 2 + dotGap

    if (cursorX + chipWidth > x + maxWidth) {
      cursorX = x
      cursorY += chipHeight + lineGap
    }

    ctx.fillStyle = CHIP_BG
    roundRectPath(ctx, cursorX, cursorY, chipWidth, chipHeight, chipHeight / 2)
    ctx.fill()

    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.arc(cursorX + paddingX + dotR, cursorY + chipHeight / 2, dotR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = INK
    ctx.textBaseline = 'middle'
    ctx.fillText(item, cursorX + paddingX + dotR * 2 + dotGap, cursorY + chipHeight / 2 + 2)
    ctx.textBaseline = 'alphabetic'

    cursorX += chipWidth + gap
  }

  return cursorY + chipHeight
}

const MAX_FIELD_LEN = { propertyType: 120, location: 120, price: 40, highlights: 200 } as const

export function drawPostCard(canvas: HTMLCanvasElement, rawData: PostData) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const data: PostData = {
    propertyType: rawData.propertyType.slice(0, MAX_FIELD_LEN.propertyType),
    location: rawData.location.slice(0, MAX_FIELD_LEN.location),
    price: rawData.price.slice(0, MAX_FIELD_LEN.price),
    highlights: rawData.highlights.slice(0, MAX_FIELD_LEN.highlights),
  }

  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT

  // ---- base ----
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  // ---- hero band ----
  const heroHeight = 500
  const heroGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, heroHeight)
  heroGradient.addColorStop(0, '#1f2937')
  heroGradient.addColorStop(1, '#0b0f19')
  ctx.fillStyle = heroGradient
  ctx.fillRect(0, 0, CARD_WIDTH, heroHeight)

  // diagonal accent stripes
  ctx.save()
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 40
  for (let i = -2; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 140, 0)
    ctx.lineTo(i * 140 + heroHeight, heroHeight)
    ctx.stroke()
  }
  ctx.restore()

  // "NEW LISTING" pill
  ctx.font = '700 24px "Segoe UI", system-ui, sans-serif'
  const pillText = 'NEW LISTING'
  const pillPaddingX = 26
  const pillWidth = ctx.measureText(pillText).width + pillPaddingX * 2
  const pillHeight = 56
  ctx.fillStyle = ACCENT
  roundRectPath(ctx, 64, 64, pillWidth, pillHeight, pillHeight / 2)
  ctx.fill()
  ctx.fillStyle = '#1f2937'
  ctx.textBaseline = 'middle'
  ctx.fillText(pillText, 64 + pillPaddingX, 64 + pillHeight / 2 + 2)
  ctx.textBaseline = 'alphabetic'

  // price block bottom-left of hero
  ctx.font = '500 26px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('PRICE', 64, heroHeight - 118)

  ctx.font = '800 76px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  const priceText = data.price.trim() || 'Price on request'
  ctx.fillText(priceText, 64, heroHeight - 56, CARD_WIDTH - 128)

  // ---- content area ----
  let y = heroHeight + 90

  ctx.font = '800 56px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = INK
  const propertyText = data.propertyType.trim() || 'Property Listing'
  y = wrapText(ctx, propertyText, 64, y, CARD_WIDTH - 128, 66, 2)

  y += 20
  ctx.font = '500 32px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = SLATE
  const locationText = data.location.trim() || 'Location available on request'
  drawPinIcon(ctx, 76, y - 29, 24, SLATE)
  y = wrapText(ctx, locationText, 100, y, CARD_WIDTH - 164, 42, 1)

  y += 36
  ctx.strokeStyle = LIGHT_BORDER
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(64, y)
  ctx.lineTo(CARD_WIDTH - 64, y)
  ctx.stroke()

  y += 48
  const highlights = splitHighlights(data.highlights)
  if (highlights.length > 0) {
    drawChips(ctx, highlights, 64, y, CARD_WIDTH - 128)
  }

  // ---- brand strip (footer) ----
  const footerHeight = 150
  const footerY = CARD_HEIGHT - footerHeight
  ctx.fillStyle = '#0b0f19'
  ctx.fillRect(0, footerY, CARD_WIDTH, footerHeight)

  // monogram
  const monoCenterX = 64 + 42
  const monoCenterY = footerY + footerHeight / 2
  ctx.fillStyle = ACCENT
  ctx.beginPath()
  ctx.arc(monoCenterX, monoCenterY, 42, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '800 40px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#0b0f19'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(BRAND.monogram, monoCenterX, monoCenterY + 3)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const brandTextX = monoCenterX + 62
  ctx.font = '700 32px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(BRAND.name, brandTextX, monoCenterY - 4)

  ctx.font = '500 22px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(BRAND.tagline, brandTextX, monoCenterY + 26)

  // contact, right aligned
  ctx.textAlign = 'right'
  ctx.font = '700 30px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(BRAND.contact, CARD_WIDTH - 64, monoCenterY + 10)

  const contactWidth = ctx.measureText(BRAND.contact).width
  ctx.font = '700 20px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = ACCENT
  ctx.fillText('CALL', CARD_WIDTH - 64 - contactWidth - 18, monoCenterY + 8)
  ctx.textAlign = 'left'
}
