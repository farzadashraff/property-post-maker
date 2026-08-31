export interface PropertyPostData {
  propertyType: string
  location: string
  price: string
  highlights: string
}

export type PropertyField = keyof PropertyPostData
