import { BRAND } from '../branding'
import type { ResolvedPostData } from './deriveData'
import { isFieldFilled } from './validation'
import { roundRectPath, wrapText, ellipsize, fitFontSize } from './canvasText'
import { drawPinIcon, drawPhoneIcon } from './icons'

export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350

const FONT = '"Segoe UI", system-ui, sans-serif'
const MARGIN = 64

const INK = BRAND.colors.ink
const SLATE = BRAND.colors.slate
const LIGHT_BORDER = BRAND.colors.border
const CHIP_BG = BRAND.colors.chipBg
const ACCENT = BRAND.colors.primary
const DEEP = BRAND.colors.secondary

// Generous ceilings that sit well above anything that could ever visually
// fit on the card (even for the narrowest characters) — these exist purely
// to guard against pathological pastes (thousands of chars), not to do
// routine truncation. The actual visible cutoff — the one that gets a
// proper "…" — is always decided by wrapText/fitFontSize/ellipsize below.
// If a raw cap here were small enough to bite before that logic runs, text
// would get chopped mid-word with no ellipsis (see: price field regression).
const MAX_FIELD_LEN = { propertyType: 300, location: 300, price: 100 } as const

const HERO_HEIGHT = 500
const FOOTER_HEIGHT = 172
const FOOTER_Y = CARD_HEIGHT - FOOTER_HEIGHT

export interface DrawResult {
  highlightsShown: number
  highlightsTotal: number
}

const EMPTY_RESULT: DrawResult = { highlightsShown: 0, highlightsTotal: 0 }

export function drawPostCard(canvas: HTMLCanvasElement, rawData: ResolvedPostData): DrawResult {
  const ctx = canvas.getContext('2d')
  if (!ctx) return EMPTY_RESULT

  const data: ResolvedPostData = {
    propertyType: rawData.propertyType.slice(0, MAX_FIELD_LEN.propertyType),
    location: rawData.location.slice(0, MAX_FIELD_LEN.location),
    price: rawData.price.slice(0, MAX_FIELD_LEN.price),
    highlightsList: rawData.highlightsList,
  }

  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const touched =
    isFieldFilled(data.propertyType) ||
    isFieldFilled(data.location) ||
    isFieldFilled(data.price) ||
    data.highlightsList.length > 0

  // The brand strip is drawn regardless of whether the user has typed
  // anything — it is not user content, it is the automatic part of the
  // design, and it should visibly exist even on a blank form.
  if (!touched) {
    drawHeroFrame(ctx, null)
    drawEmptyStateMessage(ctx)
    drawBrandStrip(ctx)
    return EMPTY_RESULT
  }

  drawHeroFrame(ctx, data.price)
  let y = drawPropertyInfoSection(ctx, data)

  y += 36
  ctx.strokeStyle = LIGHT_BORDER
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(CARD_WIDTH - MARGIN, y)
  ctx.stroke()

  y += 48
  const result = drawHighlightsSection(ctx, data.highlightsList, y)

  drawBrandStrip(ctx)

  return result
}

/** Hero band: gradient, diagonal texture, "NEW LISTING" status pill, price. */
function drawHeroFrame(ctx: CanvasRenderingContext2D, price: string | null) {
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, HERO_HEIGHT)
  gradient.addColorStop(0, '#1f2937')
  gradient.addColorStop(1, DEEP)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, HERO_HEIGHT)

  ctx.save()
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 40
  for (let i = -2; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 140, 0)
    ctx.lineTo(i * 140 + HERO_HEIGHT, HERO_HEIGHT)
    ctx.stroke()
  }
  ctx.restore()

  // Status label — automatically applied, never typed by the user.
  ctx.font = `700 24px ${FONT}`
  const pillText = 'NEW LISTING'
  const pillPaddingX = 26
  const pillWidth = ctx.measureText(pillText).width + pillPaddingX * 2
  const pillHeight = 56
  ctx.fillStyle = ACCENT
  roundRectPath(ctx, MARGIN, 64, pillWidth, pillHeight, pillHeight / 2)
  ctx.fill()
  ctx.fillStyle = '#1f2937'
  ctx.textBaseline = 'middle'
  ctx.fillText(pillText, MARGIN + pillPaddingX, 64 + pillHeight / 2 + 2)
  ctx.textBaseline = 'alphabetic'

  if (price === null) return

  ctx.font = `500 26px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('PRICE', MARGIN, HERO_HEIGHT - 118)

  const priceMaxWidth = CARD_WIDTH - MARGIN * 2
  if (isFieldFilled(price)) {
    let priceText = price.trim()
    const priceFontSize = fitFontSize(ctx, priceText, priceMaxWidth, 800, FONT, 76, 34)
    ctx.font = `800 ${priceFontSize}px ${FONT}`
    ctx.fillStyle = '#ffffff'
    priceText = ellipsize(ctx, priceText, priceMaxWidth)
    ctx.fillText(priceText, MARGIN, HERO_HEIGHT - 56)
  } else {
    ctx.font = `italic 500 34px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('Add a price', MARGIN, HERO_HEIGHT - 56)
  }
}

/** Property title (primary) + location (secondary, with pin icon). */
function drawPropertyInfoSection(ctx: CanvasRenderingContext2D, data: ResolvedPostData): number {
  let y = HERO_HEIGHT + 90
  const maxWidth = CARD_WIDTH - MARGIN * 2

  if (isFieldFilled(data.propertyType)) {
    ctx.font = `800 56px ${FONT}`
    ctx.fillStyle = INK
    y = wrapText(ctx, data.propertyType.trim(), MARGIN, y, maxWidth, 66, 2)
  } else {
    ctx.font = `italic 500 34px ${FONT}`
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('Property name will appear here', MARGIN, y)
    y += 50
  }

  y += 20

  if (isFieldFilled(data.location)) {
    ctx.font = `500 32px ${FONT}`
    ctx.fillStyle = SLATE
    drawPinIcon(ctx, MARGIN + 12, y - 29, 24, SLATE)
    y = wrapText(ctx, data.location.trim(), MARGIN + 36, y, maxWidth - 36, 42, 1)
  } else {
    ctx.font = `italic 400 24px ${FONT}`
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('Location will appear here', MARGIN, y)
    y += 30
  }

  return y
}

interface ChipLayoutResult {
  shown: number
}

/** Highlight chips: already-merged/deduped items, drawn height-aware so they can never overlap the brand strip below. */
function drawHighlightsSection(ctx: CanvasRenderingContext2D, items: string[], y: number): DrawResult {
  if (items.length === 0) {
    ctx.font = `italic 400 24px ${FONT}`
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('Highlights will appear here, e.g. "3000 sq.ft · Corner plot · Ready to move"', MARGIN, y)
    return { highlightsShown: 0, highlightsTotal: 0 }
  }

  const footerSafetyMargin = 24
  const availableHeight = FOOTER_Y - footerSafetyMargin - y
  const { shown } = drawChips(ctx, items, MARGIN, y, CARD_WIDTH - MARGIN * 2, availableHeight)
  return { highlightsShown: shown, highlightsTotal: items.length }
}

function drawChips(
  ctx: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
): ChipLayoutResult {
  const paddingX = 22
  const paddingY = 16
  const gap = 14
  const lineGap = 16
  const fontSize = 27
  ctx.font = `600 ${fontSize}px ${FONT}`

  let cursorX = x
  let cursorY = y
  const chipHeight = fontSize + paddingY * 2

  const dotGap = 14
  const dotR = 6

  const maxTextWidth = maxWidth - paddingX * 2 - dotR * 2 - dotGap
  const limitY = y + maxHeight

  let shown = 0

  for (const rawItem of items) {
    const item = ellipsize(ctx, rawItem, maxTextWidth)
    const textWidth = ctx.measureText(item).width
    const chipWidth = textWidth + paddingX * 2 + dotR * 2 + dotGap

    let rowY = cursorY
    if (cursorX + chipWidth > x + maxWidth) {
      rowY = cursorY + chipHeight + lineGap
    }

    // Stop before drawing a chip (or wrapping to a new row) that would
    // cross into the footer's territory — never clip or overlap it.
    if (rowY + chipHeight > limitY) break

    if (rowY !== cursorY) {
      cursorX = x
      cursorY = rowY
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
    shown += 1
  }

  return { shown }
}

/** The single centered message shown when the form hasn't been touched at all yet. */
function drawEmptyStateMessage(ctx: CanvasRenderingContext2D) {
  const centerX = CARD_WIDTH / 2
  const centerY = HERO_HEIGHT + (FOOTER_Y - HERO_HEIGHT) / 2

  ctx.save()
  ctx.textAlign = 'center'

  // A simple outlined document/post mark — decorative, not a fake photo.
  const markSize = 72
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 4
  roundRectPath(ctx, centerX - markSize / 2, centerY - 96 - markSize / 2, markSize, markSize, 16)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(centerX - markSize / 4, centerY - 96 - 8)
  ctx.lineTo(centerX + markSize / 4, centerY - 96 - 8)
  ctx.moveTo(centerX - markSize / 4, centerY - 96 + 12)
  ctx.lineTo(centerX + markSize / 4, centerY - 96 + 12)
  ctx.stroke()

  ctx.font = `600 34px ${FONT}`
  ctx.fillStyle = '#6b7280'
  ctx.fillText('Your property post will appear here', centerX, centerY + 10)

  ctx.font = `400 24px ${FONT}`
  ctx.fillStyle = '#9ca3af'
  ctx.fillText('Fill in the 4 fields to generate it', centerX, centerY + 50)

  ctx.restore()
}

/**
 * The brand strip. This is the part of the design the assignment calls out
 * specifically: it must read as an unmistakably intentional, automatically-
 * applied footer — never as text that happens to sit at the bottom of the
 * card. Every value drawn here comes from BRAND, never from user input.
 */
function drawBrandStrip(ctx: CanvasRenderingContext2D) {
  const centerY = FOOTER_Y + FOOTER_HEIGHT / 2

  ctx.fillStyle = DEEP
  ctx.fillRect(0, FOOTER_Y, CARD_WIDTH, FOOTER_HEIGHT)

  // A top accent bar "seals" the strip as its own distinct zone, visually
  // separate from the property content above it.
  ctx.fillStyle = ACCENT
  ctx.fillRect(0, FOOTER_Y, CARD_WIDTH, 4)

  // Logo tile — a rounded badge with a border ring, read as a mark rather
  // than a plain colored circle of text.
  const tileSize = 76
  const tileX = MARGIN
  const tileY = centerY - tileSize / 2
  ctx.fillStyle = ACCENT
  roundRectPath(ctx, tileX, tileY, tileSize, tileSize, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  roundRectPath(ctx, tileX + 1, tileY + 1, tileSize - 2, tileSize - 2, 17)
  ctx.stroke()

  ctx.font = `800 38px ${FONT}`
  ctx.fillStyle = DEEP
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(BRAND.monogram, tileX + tileSize / 2, tileY + tileSize / 2 + 2)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // "LISTED BY" eyebrow makes the purpose of this block unambiguous: this
  // is an attribution strip, not incidental text.
  const textX = tileX + tileSize + 24
  ctx.font = `700 15px ${FONT}`
  ctx.fillStyle = ACCENT
  ctx.save()
  ctx.textBaseline = 'alphabetic'
  const eyebrow = 'LISTED BY'
  const spacedEyebrow = eyebrow.split('').join('  ')
  ctx.fillText(spacedEyebrow, textX, centerY - 20)
  ctx.restore()

  ctx.font = `700 32px ${FONT}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(BRAND.name, textX, centerY + 14)

  ctx.font = `500 21px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(BRAND.role, textX, centerY + 42)

  // Contact chip — a bordered pill on the right, read as a distinct
  // "tap to call" style affordance rather than plain floating text.
  ctx.font = `700 30px ${FONT}`
  const numberWidth = ctx.measureText(BRAND.phone).width
  ctx.font = `700 16px ${FONT}`
  const callLabelWidth = ctx.measureText('CALL').width

  const iconSize = 26
  const innerGap = 12
  const chipPaddingX = 22
  const chipContentWidth = iconSize + innerGap + callLabelWidth + innerGap + numberWidth
  const chipWidth = chipContentWidth + chipPaddingX * 2
  const chipHeight = 68
  const chipX = CARD_WIDTH - MARGIN - chipWidth
  const chipY = centerY - chipHeight / 2

  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  roundRectPath(ctx, chipX, chipY, chipWidth, chipHeight, chipHeight / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1.5
  roundRectPath(ctx, chipX, chipY, chipWidth, chipHeight, chipHeight / 2)
  ctx.stroke()

  let cursorX = chipX + chipPaddingX
  drawPhoneIcon(ctx, cursorX + iconSize / 2, centerY, iconSize, ACCENT, DEEP)
  cursorX += iconSize + innerGap

  ctx.font = `700 16px ${FONT}`
  ctx.fillStyle = ACCENT
  ctx.textBaseline = 'middle'
  ctx.fillText('CALL', cursorX, centerY + 1)
  cursorX += callLabelWidth + innerGap

  ctx.font = `700 30px ${FONT}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(BRAND.phone, cursorX, centerY + 2)
  ctx.textBaseline = 'alphabetic'
}
