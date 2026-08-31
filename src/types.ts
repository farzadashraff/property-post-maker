export interface PropertyPostData {
  propertyType: string
  location: string
  customLocation: string
  useCustomLocation: boolean
  price: string
  highlights: string
  selectedHighlights: string[]
}

export type PropertyField = keyof Pick<PropertyPostData, 'propertyType' | 'location' | 'price' | 'highlights'>
