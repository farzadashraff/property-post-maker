import type { PropertyField, PropertyPostData } from '../types'
import { resolvePostData } from './deriveData'

export const FIELD_LABELS: Record<PropertyField, string> = {
  propertyType: 'Property & Type',
  location: 'Location',
  price: 'Price',
  highlights: 'Highlights',
}

export const FIELD_ORDER: PropertyField[] = ['propertyType', 'location', 'price', 'highlights']

export function isFieldFilled(value: string): boolean {
  return value.trim().length > 0
}

export function getMissingFields(data: PropertyPostData): PropertyField[] {
  const resolved = resolvePostData(data)
  const missing: PropertyField[] = []
  if (!isFieldFilled(resolved.propertyType)) missing.push('propertyType')
  if (!isFieldFilled(resolved.location)) missing.push('location')
  if (!isFieldFilled(resolved.price)) missing.push('price')
  if (resolved.highlightsList.length === 0) missing.push('highlights')
  return missing
}

export function isFormComplete(data: PropertyPostData): boolean {
  return getMissingFields(data).length === 0
}

export function isFormTouched(data: PropertyPostData): boolean {
  const resolved = resolvePostData(data)
  return (
    isFieldFilled(resolved.propertyType) ||
    isFieldFilled(resolved.location) ||
    isFieldFilled(resolved.price) ||
    resolved.highlightsList.length > 0
  )
}

export function describeMissingFields(missing: PropertyField[]): string {
  if (missing.length === 0) return ''
  const labels = missing.map((key) => FIELD_LABELS[key])
  if (labels.length === 1) return `Add ${labels[0]} to generate your post.`
  if (labels.length === 2) return `Add ${labels[0]} and ${labels[1]} to generate your post.`
  const last = labels[labels.length - 1]
  return `Add ${labels.slice(0, -1).join(', ')}, and ${last} to generate your post.`
}
