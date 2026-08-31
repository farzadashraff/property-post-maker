import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent } from 'react'
import { BRAND } from './branding'
import { drawPostCard } from './lib/postRenderer'
import { getMissingFields, describeMissingFields, isFormTouched } from './lib/validation'
import { buildDownloadFilename } from './lib/filename'
import { PropertyForm } from './components/PropertyForm'
import { PostPreview } from './components/PostPreview'
import type { PropertyField, PropertyPostData } from './types'

const EXAMPLE: PropertyPostData = {
  propertyType: '4 BHK Luxury Villa, Ansal Golf City',
  location: 'Sushant Golf City, Lucknow',
  price: '₹2.5 Cr onwards',
  highlights: '3000 sq.ft · Corner plot · Ready to move',
}

const EMPTY: PropertyPostData = {
  propertyType: '',
  location: '',
  price: '',
  highlights: '',
}

const DOWNLOAD_FEEDBACK_MS = 1800

export default function App() {
  const [data, setData] = useState<PropertyPostData>(EMPTY)
  const [highlightsFit, setHighlightsFit] = useState({ highlightsShown: 0, highlightsTotal: 0 })
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const feedbackTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (canvasRef.current) {
      setHighlightsFit(drawPostCard(canvasRef.current, data))
    }
  }, [data])

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), [])

  const handleFieldChange = (field: PropertyField, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    if (downloadState === 'success') {
      window.clearTimeout(feedbackTimer.current)
      setDownloadState('idle')
    }
  }

  // A single-line <input> silently strips \n before onChange ever fires, so
  // a multi-line paste (e.g. from Notes/WhatsApp, one highlight per line)
  // would otherwise collapse into one run-on word with no separator.
  const handleHighlightsPaste = (e: ClipboardEvent<HTMLInputElement>) => {
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
    handleFieldChange('highlights', newValue)
  }

  const missingFields = getMissingFields(data)
  const canDownload = missingFields.length === 0 && downloadState !== 'downloading'
  const isTouched = isFormTouched(data)

  const handleDownload = () => {
    if (missingFields.length > 0 || downloadState === 'downloading') return
    const canvas = canvasRef.current
    if (!canvas) return

    setDownloadState('downloading')
    const link = document.createElement('a')
    link.download = buildDownloadFilename(data.propertyType)
    link.href = canvas.toDataURL('image/png')
    link.click()

    setDownloadState('success')
    window.clearTimeout(feedbackTimer.current)
    feedbackTimer.current = window.setTimeout(() => setDownloadState('idle'), DOWNLOAD_FEEDBACK_MS)
  }

  const handleLoadSample = () => setData(EXAMPLE)
  const handleClear = () => {
    setData(EMPTY)
    window.clearTimeout(feedbackTimer.current)
    setDownloadState('idle')
  }

  const { highlightsShown, highlightsTotal } = highlightsFit

  const previewDescription = !isTouched
    ? 'Property post preview: empty. Fill in the 4 fields to generate your branded post.'
    : [
        'Property post preview.',
        data.propertyType.trim() || 'Property name not yet entered.',
        data.location.trim() ? `in ${data.location.trim()}` : 'Location not yet entered.',
        data.price.trim() ? `priced at ${data.price.trim()}` : 'Price not yet entered.',
        data.highlights.trim() ? `Highlights: ${data.highlights.trim()}.` : 'Highlights not yet entered.',
        `Branded automatically with ${BRAND.name}, ${BRAND.role}, contact ${BRAND.phone}.`,
      ].join(' ')

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
        <PropertyForm
          data={data}
          onFieldChange={handleFieldChange}
          onHighlightsPaste={handleHighlightsPaste}
          highlightsShown={highlightsShown}
          highlightsTotal={highlightsTotal}
          isTouched={isTouched}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          canDownload={canDownload}
          missingFieldsMessage={describeMissingFields(missingFields)}
          downloadState={downloadState === 'downloading' ? 'idle' : downloadState}
          onDownload={handleDownload}
        />

        <PostPreview ref={canvasRef} description={previewDescription} />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Property Post Maker — designed &amp; built by {BRAND.name} using Claude Code
      </footer>
    </div>
  )
}
