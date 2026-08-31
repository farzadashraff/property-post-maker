import type { ClipboardEvent } from 'react'
import type { PropertyPostData } from '../types'
import { Autocomplete } from './Autocomplete'
import { HighlightCheckboxes } from './HighlightCheckboxes'
import { filterSuggestions } from '../lib/suggestions'
import { PROPERTY_TYPES } from '../data/propertyTypes'
import { CITIES } from '../data/cities'
import { PRICE_SUGGESTIONS } from '../data/priceSuggestions'
import { HIGHLIGHT_OPTIONS } from '../data/highlightOptions'

const OTHER_LOCATION_LABEL = 'Other — Enter a custom location'

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
  onUpdate,
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
  onUpdate: (patch: Partial<PropertyPostData>) => void
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

  const cityOptions = filterSuggestions(CITIES, data.location).map((value) => ({ value }))
  const locationOptions = data.location.trim()
    ? [...cityOptions, { value: OTHER_LOCATION_LABEL, isOther: true }]
    : []

  const toggleHighlight = (option: string) => {
    const next = data.selectedHighlights.includes(option)
      ? data.selectedHighlights.filter((h) => h !== option)
      : [...data.selectedHighlights, option]
    onUpdate({ selectedHighlights: next })
  }

  return (
    <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-bold text-gray-900">1. Enter property details</h2>
      <div className="space-y-4">
        <Autocomplete
          label="Property & Type"
          placeholder="e.g. 4 BHK Luxury Villa, Ansal Golf City"
          value={data.propertyType}
          onChange={(v) => onUpdate({ propertyType: v })}
          options={filterSuggestions(PROPERTY_TYPES, data.propertyType).map((value) => ({ value }))}
          onSelectOption={(option) => onUpdate({ propertyType: option.value })}
          maxLength={300}
        />

        {data.useCustomLocation ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Location</span>
              <button
                type="button"
                onClick={() => onUpdate({ useCustomLocation: false, customLocation: '' })}
                className="text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
              >
                Search cities instead
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={data.customLocation}
              placeholder="Enter your location"
              maxLength={300}
              onChange={(e) => onUpdate({ customLocation: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 outline-none transition focus:border-gray-900 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900/60"
            />
          </div>
        ) : (
          <Autocomplete
            label="Location"
            placeholder="e.g. Sushant Golf City, Lucknow"
            value={data.location}
            onChange={(v) => onUpdate({ location: v })}
            options={locationOptions}
            onSelectOption={(option) =>
              option.isOther
                ? onUpdate({ useCustomLocation: true, location: '', customLocation: '' })
                : onUpdate({ location: option.value })
            }
            maxLength={300}
            emptyHint="No matching city — keep typing, or pick Other below."
          />
        )}

        <Autocomplete
          label="Price"
          placeholder="e.g. ₹2.5 Cr onwards"
          value={data.price}
          onChange={(v) => onUpdate({ price: v })}
          options={filterSuggestions(PRICE_SUGGESTIONS, data.price).map((value) => ({ value }))}
          onSelectOption={(option) => onUpdate({ price: option.value })}
          maxLength={100}
        />

        <div>
          <Field
            label="Highlights"
            placeholder="e.g. 3000 sq.ft · Corner plot · Ready to move"
            value={data.highlights}
            onChange={(v) => onUpdate({ highlights: v })}
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
          <HighlightCheckboxes options={HIGHLIGHT_OPTIONS} selected={data.selectedHighlights} onToggle={toggleHighlight} />
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
