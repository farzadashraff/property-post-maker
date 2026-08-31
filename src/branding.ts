/**
 * Centralized branding configuration.
 *
 * This is the ONLY place brand identity is defined. The user never types
 * any of this — the renderer and UI both read from here, so there is
 * exactly one place to update if the brand ever changes.
 */
export interface BrandConfig {
  name: string
  role: string
  phone: string
  monogram: string
  colors: {
    primary: string
    secondary: string
    ink: string
    slate: string
    border: string
    chipBg: string
  }
}

export const BRAND: BrandConfig = {
  name: 'Farzad',
  role: 'Property Post Maker',
  phone: '+91 9605005511',
  monogram: 'F',
  colors: {
    primary: '#d4a24e',
    secondary: '#0b0f19',
    ink: '#111827',
    slate: '#4b5563',
    border: '#e5e7eb',
    chipBg: '#f3f4f6',
  },
}
