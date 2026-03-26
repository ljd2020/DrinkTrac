export interface DefaultDrink {
  name: string
  volumeMl: number
  abv: number
  icon: string
  category: 'beer' | 'wine' | 'spirit' | 'cocktail' | 'custom'
  defaultDurationMinutes: number
}

export const CATEGORY_DEFAULT_DURATION: Record<string, number> = {
  spirit: 5,
  wine: 20,
  beer: 20,
  cocktail: 25,
  custom: 15,
}

export const DEFAULT_DRINKS: DefaultDrink[] = [
  // Beer
  { name: 'Light Beer', volumeMl: 355, abv: 0.04, icon: '🍺', category: 'beer', defaultDurationMinutes: 20 },
  { name: 'Regular Beer', volumeMl: 355, abv: 0.05, icon: '🍺', category: 'beer', defaultDurationMinutes: 20 },
  { name: 'Strong Beer', volumeMl: 355, abv: 0.07, icon: '🍺', category: 'beer', defaultDurationMinutes: 20 },
  { name: 'IPA', volumeMl: 355, abv: 0.065, icon: '🍺', category: 'beer', defaultDurationMinutes: 20 },
  { name: 'Pint of Beer', volumeMl: 473, abv: 0.05, icon: '🍺', category: 'beer', defaultDurationMinutes: 25 },

  // Wine
  { name: 'Red Wine', volumeMl: 150, abv: 0.135, icon: '🍷', category: 'wine', defaultDurationMinutes: 20 },
  { name: 'White Wine', volumeMl: 150, abv: 0.12, icon: '🥂', category: 'wine', defaultDurationMinutes: 20 },
  { name: 'Rose Wine', volumeMl: 150, abv: 0.115, icon: '🍷', category: 'wine', defaultDurationMinutes: 20 },
  { name: 'Champagne', volumeMl: 150, abv: 0.12, icon: '🥂', category: 'wine', defaultDurationMinutes: 15 },

  // Spirits
  { name: 'Shot of Vodka', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit', defaultDurationMinutes: 5 },
  { name: 'Shot of Whiskey', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit', defaultDurationMinutes: 5 },
  { name: 'Shot of Tequila', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit', defaultDurationMinutes: 5 },
  { name: 'Shot of Rum', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit', defaultDurationMinutes: 5 },
  { name: 'Shot of Gin', volumeMl: 44, abv: 0.40, icon: '🥃', category: 'spirit', defaultDurationMinutes: 5 },

  // Cocktails
  { name: 'Margarita', volumeMl: 240, abv: 0.13, icon: '🍸', category: 'cocktail', defaultDurationMinutes: 25 },
  { name: 'Martini', volumeMl: 180, abv: 0.18, icon: '🍸', category: 'cocktail', defaultDurationMinutes: 20 },
  { name: 'Mojito', volumeMl: 240, abv: 0.10, icon: '🍹', category: 'cocktail', defaultDurationMinutes: 25 },
  { name: 'Long Island', volumeMl: 300, abv: 0.22, icon: '🍹', category: 'cocktail', defaultDurationMinutes: 30 },
  { name: 'Rum & Coke', volumeMl: 300, abv: 0.08, icon: '🍹', category: 'cocktail', defaultDurationMinutes: 25 },
  { name: 'Vodka Soda', volumeMl: 300, abv: 0.06, icon: '🍹', category: 'cocktail', defaultDurationMinutes: 20 },
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
