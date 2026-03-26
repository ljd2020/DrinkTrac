export interface DefaultDrink {
  name: string
  volumeMl: number
  abv: number
  icon: string
  category: 'beer' | 'wine' | 'spirit' | 'cocktail' | 'custom'
}

export const DEFAULT_DRINKS: DefaultDrink[] = [
  // Beer
  { name: 'Light Beer', volumeMl: 355, abv: 0.04, icon: '🍺', category: 'beer' },
  { name: 'Regular Beer', volumeMl: 355, abv: 0.05, icon: '🍺', category: 'beer' },
  { name: 'Strong Beer', volumeMl: 355, abv: 0.07, icon: '🍺', category: 'beer' },
  { name: 'IPA', volumeMl: 355, abv: 0.065, icon: '🍺', category: 'beer' },
  { name: 'Pint of Beer', volumeMl: 473, abv: 0.05, icon: '🍺', category: 'beer' },

  // Wine
  { name: 'Red Wine', volumeMl: 150, abv: 0.135, icon: '🍷', category: 'wine' },
  { name: 'White Wine', volumeMl: 150, abv: 0.12, icon: '🥂', category: 'wine' },
  { name: 'Rose Wine', volumeMl: 150, abv: 0.115, icon: '🍷', category: 'wine' },
  { name: 'Champagne', volumeMl: 150, abv: 0.12, icon: '🥂', category: 'wine' },

  // Spirits
  { name: 'Shot of Vodka', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit' },
  { name: 'Shot of Whiskey', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit' },
  { name: 'Shot of Tequila', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit' },
  { name: 'Shot of Rum', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit' },
  { name: 'Shot of Gin', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit' },

  // Cocktails
  { name: 'Margarita', volumeMl: 240, abv: 0.13, icon: '🍸', category: 'cocktail' },
  { name: 'Martini', volumeMl: 180, abv: 0.18, icon: '🍸', category: 'cocktail' },
  { name: 'Mojito', volumeMl: 240, abv: 0.10, icon: '🍹', category: 'cocktail' },
  { name: 'Long Island', volumeMl: 300, abv: 0.22, icon: '🍹', category: 'cocktail' },
  { name: 'Rum & Coke', volumeMl: 300, abv: 0.08, icon: '🍹', category: 'cocktail' },
  { name: 'Vodka Soda', volumeMl: 300, abv: 0.06, icon: '🍹', category: 'cocktail' },
]

// Alcohol density: 0.789 g/mL
export const ALCOHOL_DENSITY = 0.789

// Default metabolism rates (g/dL/hr) by drinking frequency
export const METABOLISM_RATES: Record<string, number> = {
  rarely: 0.015,
  occasionally: 0.016,
  regularly: 0.017,
  frequently: 0.020,
}

// Absorption rate constants (per hour) by stomach content
// Higher values = faster absorption. These are calibrated so that
// on empty stomach, ~90% of alcohol is absorbed within 30 minutes.
export const ABSORPTION_RATES: Record<string, number> = {
  empty: 6.0,
  light: 3.5,
  moderate: 2.0,
  full: 1.2,
}

export const BAC_THRESHOLDS = {
  safe: 0.04,
  caution: 0.08,
} as const
