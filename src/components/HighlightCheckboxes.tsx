export function HighlightCheckboxes({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[]
  selected: string[]
  onToggle: (option: string) => void
}) {
  return (
    <fieldset className="mt-2">
      <legend className="mb-1.5 text-xs font-semibold text-gray-500">Optional: add predefined highlights</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <label
              key={option}
              className={`relative cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition select-none ${
                checked
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option)}
                aria-label={option}
                className="peer sr-only"
              />
              <span className="pointer-events-none absolute inset-0 rounded-full ring-gray-900/60 peer-focus-visible:ring-2" />
              {checked ? '✓ ' : ''}
              {option}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
