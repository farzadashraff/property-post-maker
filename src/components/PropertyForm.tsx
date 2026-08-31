import type { ClipboardEvent } from 'react'
import type { PropertyField, PropertyPostData } from '../types'

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
  onPaste?: (e: ClipboardEvent<HTMLInputElement>) => void
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

export function PropertyForm({
  data,
  onFieldChange,
  onHighlightsPaste,
  highlightsShown,
  highlightsTotal,
  isTouched,
  onLoadSample,
  onClear,
  canDownload,
  missingFieldsMessage,
  downloadState,
  onDownload,
}: {
  data: PropertyPostData
  onFieldChange: (field: PropertyField, value: string) => void
  onHighlightsPaste: (e: ClipboardEvent<HTMLInputElement>) => void
  highlightsShown: number
  highlightsTotal: number
  isTouched: boolean
  onLoadSample: () => void
  onClear: () => void
  canDownload: boolean
  missingFieldsMessage: string
  downloadState: 'idle' | 'success'
  onDownload: () => void
}) {
  const hiddenHighlights = Math.max(0, highlightsTotal - highlightsShown)

  return (
    <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-bold text-gray-900">1. Enter property details</h2>
      <div className="space-y-4">
        <Field
          label="Property & Type"
          placeholder="e.g. 4 BHK Luxury Villa, Ansal Golf City"
          value={data.propertyType}
          onChange={(v) => onFieldChange('propertyType', v)}
          maxLength={300}
        />
        <Field
          label="Location"
          placeholder="e.g. Sushant Golf City, Lucknow"
          value={data.location}
          onChange={(v) => onFieldChange('location', v)}
          maxLength={300}
        />
        <Field
          label="Price"
          placeholder="e.g. ₹2.5 Cr onwards"
          value={data.price}
          onChange={(v) => onFieldChange('price', v)}
          maxLength={100}
        />
        <div>
          <Field
            label="Highlights"
            placeholder="e.g. 3000 sq.ft · Corner plot · Ready to move"
            value={data.highlights}
            onChange={(v) => onFieldChange('highlights', v)}
            onPaste={onHighlightsPaste}
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

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={!canDownload}
          aria-disabled={!canDownload}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:enabled:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {downloadState === 'success' ? '✓ Downloaded' : 'Download Post (PNG)'}
        </button>
        {!canDownload && (
          <p className="text-xs font-medium text-amber-700" role="status">
            {missingFieldsMessage}
          </p>
        )}

        <button
          type="button"
          onClick={isTouched ? onClear : onLoadSample}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {isTouched ? 'Clear all fields' : 'Load sample listing'}
        </button>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-gray-400">
        Your branding, logo and contact details are added automatically.
      </p>
    </section>
  )
}
