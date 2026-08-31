import type { PropertyPostData } from '../types'
import { mergeHighlights, parseHighlights } from './highlights'

/**
 * The shape the renderer and validation actually care about — plain
 * resolved values, with no knowledge of autocomplete state, the "Other"
 * location flow, or which highlights came from typing vs. checkboxes.
 * Keeping this separate means the renderer never has to know the form's
 * UI mechanics, and the form never has to know how highlights get drawn.
 */
export interface ResolvedPostData {
  propertyType: string
  location: string
  price: string
  highlightsList: string[]
}

export function resolvePostData(data: PropertyPostData): ResolvedPostData {
  return {
    propertyType: data.propertyType,
    location: data.useCustomLocation ? data.customLocation : data.location,
    price: data.price,
    highlightsList: mergeHighlights(parseHighlights(data.highlights), data.selectedHighlights),
  }
}
