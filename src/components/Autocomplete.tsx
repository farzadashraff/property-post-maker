import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export interface AutocompleteOption {
  value: string
  isOther?: boolean
}

/**
 * A controlled combobox: free-text input backed by a filtered suggestion
 * list. The caller owns the value and the filtering — this component only
 * owns open/closed state and keyboard/mouse interaction, so it can serve
 * Property & Type, Location, and Price alike.
 *
 * Deliberately does NOT open on focus — only on typing (or ArrowDown) —
 * per the requirement that clicking an empty field must not show a
 * dropdown. The user can always keep typing a value that matches nothing;
 * nothing here ever blocks or overwrites free text.
 */
export function Autocomplete({
  label,
  placeholder,
  value,
  onChange,
  options,
  onSelectOption,
  maxLength,
  emptyHint,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  options: AutocompleteOption[]
  onSelectOption: (option: AutocompleteOption) => void
  maxLength: number
  /** Shown inside the dropdown when the user has typed something but nothing matches. */
  emptyHint?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const baseId = useId()

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const selectOption = (option: AutocompleteOption) => {
    onSelectOption(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleChange = (v: string) => {
    onChange(v)
    setIsOpen(v.trim().length > 0)
    setHighlightedIndex(0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen && value.trim().length > 0) setIsOpen(true)
      setHighlightedIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        e.preventDefault()
        selectOption(options[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
  }

  const showDropdown = isOpen && value.trim().length > 0
  const activeOptionId = highlightedIndex >= 0 ? `${baseId}-opt-${highlightedIndex}` : undefined

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700" htmlFor={baseId}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={baseId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={`${baseId}-listbox`}
        aria-activedescendant={showDropdown ? activeOptionId : undefined}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsOpen(false)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 outline-none transition focus:border-gray-900 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900/60"
      />
      {showDropdown && (
        <ul
          id={`${baseId}-listbox`}
          role="listbox"
          className="absolute z-10 mt-1.5 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-gray-400">{emptyHint ?? 'No matches — your text will be used as entered.'}</li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                id={`${baseId}-opt-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectOption(option)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer px-4 py-2.5 text-[15px] transition ${
                  index === highlightedIndex ? 'bg-amber-50 text-gray-900' : 'text-gray-700'
                } ${option.isOther ? 'border-t border-gray-100 font-medium text-gray-500 italic' : ''}`}
              >
                {option.value}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
