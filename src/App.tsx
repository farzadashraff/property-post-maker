import { useEffect, useRef, useState } from 'react'
import {
  drawPostCard,
  CARD_WIDTH,
  CARD_HEIGHT,
  BRAND,
  type PostData,
} from './lib/postCard'

const EXAMPLE: PostData = {
  propertyType: '4 BHK Luxury Villa, Ansal Golf City',
  location: 'Sushant Golf City, Lucknow',
  price: '₹2.5 Cr onwards',
  highlights: '3000 sq.ft · Corner plot · Ready to move',
}

const EMPTY: PostData = {
  propertyType: '',
  location: '',
  price: '',
  highlights: '',
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  onPaste,
  describedById,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
  describedById?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        aria-describedby={describedById}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 outline-none transition focus:border-gray-900 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900/60"
      />
    </label>
  )
}

export default function App() {
  const [data, setData] = useState<PostData>(EMPTY)
  const [highlightsFit, setHighlightsFit] = useState({ highlightsShown: 0, highlightsTotal: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      setHighlightsFit(drawPostCard(canvasRef.current, data))
    }
  }, [data])

  const update = (key: keyof PostData) => (value: string) =>
    setData((prev) => ({ ...prev, [key]: value }))

  // A single-line <input> silently strips \n before onChange ever fires,
  // so a multi-line paste (e.g. from Notes/WhatsApp) would otherwise
  // collapse into one run-on word with no separator between lines.
  const handleHighlightsPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    if (!/\r\n|\r|\n/.test(pasted)) return
    e.preventDefault()
    const normalized = pasted
      .split(/\r\n|\r|\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' · ')
    const input = e.currentTarget
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    const newValue = (input.value.slice(0, start) + normalized + input.value.slice(end)).slice(0, 500)
    update('highlights')(newValue)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    const safeName = (data.propertyType || 'property-post')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
    link.download = `${safeName || 'property-post'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const isEmpty = !data.propertyType && !data.location && !data.price && !data.highlights
  const { highlightsShown, highlightsTotal } = highlightsFit
  const hiddenHighlights = Math.max(0, highlightsTotal - highlightsShown)

  const previewDescription = isEmpty
    ? 'Property post preview: empty, showing placeholder text. Fill in the fields to generate the post.'
    : [
        `Property post preview.`,
        data.propertyType.trim() || 'Property Listing',
        data.location.trim() ? `in ${data.location.trim()}` : '',
        data.price.trim() ? `priced at ${data.price.trim()}` : '',
        data.highlights.trim() ? `Highlights: ${data.highlights.trim()}.` : '',
        `Branded with ${BRAND.name}, contact ${BRAND.contact}.`,
      ]
        .filter(Boolean)
        .join(' ')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Property Post Maker</h1>
            <p className="text-sm text-gray-500">Fill 4 fields → get a ready-to-share, branded property post</p>
          </div>
          <span className="hidden rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white sm:inline-block">
            Built by {BRAND.name}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-gray-900">1. Enter property details</h2>
          <div className="space-y-4">
            <Field
              label="Property & Type"
              placeholder="e.g. 4 BHK Luxury Villa, Ansal Golf City"
              value={data.propertyType}
              onChange={update('propertyType')}
              maxLength={300}
            />
            <Field
              label="Location"
              placeholder="e.g. Sushant Golf City, Lucknow"
              value={data.location}
              onChange={update('location')}
              maxLength={300}
            />
            <Field
              label="Price"
              placeholder="e.g. ₹2.5 Cr onwards"
              value={data.price}
              onChange={update('price')}
              maxLength={100}
            />
            <div>
              <Field
                label="Highlights"
                placeholder="e.g. 3000 sq.ft · Corner plot · Ready to move"
                value={data.highlights}
                onChange={update('highlights')}
                onPaste={handleHighlightsPaste}
                maxLength={500}
                describedById={hiddenHighlights > 0 ? 'highlights-hint' : undefined}
              />
              {hiddenHighlights > 0 && (
                <p id="highlights-hint" className="mt-1.5 text-xs font-medium text-amber-700" role="status">
                  Showing {highlightsShown} of {highlightsTotal} — the last {hiddenHighlights} won't fit on
                  the post. Shorten an item or remove one to fit more.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleDownload}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Download Post (PNG)
            </button>
            <button
              onClick={() => setData(isEmpty ? EXAMPLE : EMPTY)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {isEmpty ? 'Load sample listing' : 'Clear all fields'}
            </button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-gray-400">
            Logo, brand strip and contact details are added automatically — nothing else to type.
          </p>
        </section>

        <section className="flex flex-col items-center">
          <h2 className="mb-5 w-full text-base font-bold text-gray-900">2. Live preview</h2>
          <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
            <canvas
              ref={canvasRef}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              className="block h-auto w-full"
              role="img"
              aria-label={previewDescription}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Property Post Maker — designed &amp; built by {BRAND.name} using Claude Code
      </footer>
    </div>
  )
}
