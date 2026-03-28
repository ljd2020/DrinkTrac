# CLAUDE.md - DrinkTrac Codebase Guide

## Project Overview

DrinkTrac is a client-side Progressive Web App (PWA) for tracking Blood Alcohol Content (BAC). Built with React 19 + Vite, it uses the Widmark formula to compute real-time BAC curves based on drink consumption, user physiology, and stomach content. All data is stored locally in IndexedDB via Dexie — there is no backend or API.

**Live deployment:** GitHub Pages at `/DrinkTrac/` base path.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript (strict) |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 (HashRouter) |
| Database | Dexie 4 (IndexedDB) |
| Charting | Chart.js 4 + react-chartjs-2 |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + @testing-library/react |
| PWA | vite-plugin-pwa (Workbox) |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Directory Structure

```
DrinkTrac/
├── src/
│   ├── components/
│   │   ├── dashboard/       # BACDisplay, BACGraph, BACAlarm, SobrietyTimer
│   │   ├── session/         # ActiveDrinks, DrinkPicker
│   │   ├── drinks/          # DrinkEditor
│   │   ├── profile/         # ProfileForm
│   │   └── layout/          # AppShell (bottom nav)
│   ├── db/
│   │   └── schema.ts        # Dexie database definition & models
│   ├── hooks/               # Custom React hooks (data + business logic)
│   │   ├── useProfiles.ts
│   │   ├── useDrinks.ts
│   │   ├── useSession.ts
│   │   └── useBACCalculation.ts
│   ├── lib/                 # Pure functions and utilities
│   │   ├── bac-engine.ts        # Core BAC calculation (Widmark formula)
│   │   ├── bac-engine.test.ts   # Tests for BAC engine
│   │   ├── alcohol-utils.ts     # Unit conversions and formatting
│   │   ├── constants.ts         # Default drinks, metabolism rates, thresholds
│   │   └── notifications.ts     # Browser notification utilities
│   ├── pages/               # Route-level container components
│   │   ├── DashboardPage.tsx
│   │   ├── SessionPage.tsx
│   │   ├── DrinksPage.tsx
│   │   └── ProfilesPage.tsx
│   ├── App.tsx              # Router setup
│   ├── main.tsx             # React entry point
│   └── test-setup.ts        # Vitest bootstrap
├── public/                  # Static assets (icons, manifest)
├── index.html               # HTML shell with PWA meta tags
├── vite.config.ts           # Vite + PWA + Vitest config
├── tsconfig.app.json        # App TypeScript config (strict, ES2023)
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

---

## Architecture

### Data Flow

```
ProfilesPage / SessionPage
        ↓
  useProfiles / useSession / useDrinks (Dexie hooks)
        ↓
  useBACCalculation (consumes profile + sessionDrinks)
        ↓
  bac-engine.ts (computeBACTimeSeries)
        ↓
  DashboardPage → BACDisplay / BACGraph / SobrietyTimer
```

### Key Architectural Patterns

1. **Container / Presentational split**: Pages (`/pages`) own data fetching via hooks; components (`/components`) render props only.
2. **Custom hooks for all DB access**: No Dexie calls inside components — always use `useProfiles`, `useDrinks`, `useSession`.
3. **Reactive DB queries**: Use `useLiveQuery` from `dexie-react-hooks` for automatic re-renders on DB changes.
4. **Pure functions in `/lib`**: `bac-engine.ts` and `alcohol-utils.ts` are stateless and easily testable.
5. **Memoization**: `useMemo` for expensive computations (BAC time series, chart data). BAC recomputes on a 30s tick for in-progress drinks.

---

## Database Schema (`src/db/schema.ts`)

**Database name:** `DrinkTracDB`

| Table | Fields | Indexes |
|-------|--------|---------|
| `profiles` | id, name, weightKg, heightCm, age, sex, drinkingFrequency, isDefault | name, isDefault |
| `customDrinks` | id, name, volumeMl, abv, icon, category, defaultDurationMin | name, category |
| `sessionDrinks` | id, profileId, timestamp, volumeMl, abv, icon, durationMin, finishedAt, stomachContent | profileId, timestamp |

**Schema versioning:** Database is at v2. When adding a new field to a table, increment the version and write a migration in `schema.ts` using Dexie's `.upgrade()` callback.

---

## BAC Calculation Engine (`src/lib/bac-engine.ts`)

The core algorithm implements the **Widmark formula** with physiological modeling:

- **Widmark factor (r):** 0.68 (male) / 0.55 (female) — body water distribution ratio
- **Absorption model:** Exponential absorption over drink consumption duration; rate controlled by stomach content
- **Absorption rates** (from `constants.ts`): empty (6.0/hr), light (3.5/hr), moderate (2.0/hr), full (1.2/hr)
- **Metabolism (elimination):** Zero-order elimination after absorption peak; rate controlled by drinking frequency
- **Metabolism rates** (g/dL/hr): rarely (0.015), occasionally (0.016), regularly (0.017), frequently (0.020)
- **Output:** Array of `{time: Date, bac: number}` points at 1-minute resolution over 24 hours

**Key functions:**
- `computeBACTimeSeries(profile, drinks)` — main entry point
- `getCurrentBAC(points)` — nearest point to now
- `getTimeToSober(points)` — minutes until BAC ≈ 0
- `getPeakBAC(points)` — peak value and timestamp

**Do not modify this engine without running the full test suite.** BAC calculations affect user safety decisions.

---

## Development Commands

```bash
npm run dev          # Start dev server with HMR (localhost:5173)
npm run build        # TypeScript compile + Vite bundle
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm test             # Run Vitest test suite once
npm run test:watch   # Vitest in watch mode
```

---

## Testing

Tests live in `src/lib/bac-engine.test.ts`. Run with `npm test`.

**What is tested:**
- Widmark factor computation (male/female)
- BAC time series shape (rises, peaks, falls to zero)
- Stomach content effects on absorption rate
- Gender and weight effects on BAC magnitude
- Drinking frequency effects on metabolism rate
- `getCurrentBAC`, `getTimeToSober`, `getPeakBAC` utility functions

**Convention:** Unit tests for pure functions in `/lib`. Component tests can use `@testing-library/react` with jsdom. Do not test Dexie directly — use integration or mock approaches.

---

## CI/CD Pipeline (`.github/workflows/deploy.yml`)

Triggers on push to `main`:
1. `npm ci` — install dependencies
2. `npm test` — run test suite (blocks deploy on failure)
3. `npm run build` — compile and bundle
4. Deploy `dist/` to GitHub Pages

**Important:** All tests must pass before merging to `main`.

---

## Styling Conventions

- **Tailwind CSS v4** — utility-first, no custom CSS classes unless necessary
- **Dark theme:** Base palette is dark purple/blue (`#1e1b2e` theme color)
- **Mobile-first:** Designed for phones; bottom navigation via `AppShell`
- **Safe areas:** Use `.safe-area-top` / `.safe-area-bottom` CSS utilities (env() insets) for notched devices
- **Responsive breakpoints:** Only used sparingly; the app is primarily single-column with `grid-cols-2` for drink picker

---

## TypeScript Conventions

- **Strict mode** is enabled — no `any`, no unused vars/params
- All props must be typed via interfaces (named `[Component]Props`)
- Dexie table row types are defined in `src/db/schema.ts`
- Prefer `interface` over `type` for object shapes
- Functional components only — no class components

---

## Routing

Uses **HashRouter** (required for GitHub Pages static hosting):

| Hash Route | Component | Purpose |
|-----------|-----------|---------|
| `#/` | DashboardPage | BAC stats, graph, alarm |
| `#/session` | SessionPage | Add/manage drinks |
| `#/library` | DrinksPage | Browse/create custom drinks |
| `#/profile` | ProfilesPage | User profiles |

---

## localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `useImperial` | boolean | Metric vs imperial unit toggle in ProfileForm |
| `bacAlarmEnabled` | boolean | BAC alarm notification toggle |
| `bacAlarmThreshold` | number | BAC level that triggers alarm (default 0.08) |

---

## Common Pitfalls

1. **Base path:** Vite is configured with `base: '/DrinkTrac/'`. All asset imports and router links must be relative or respect this base.
2. **No backend:** If you find yourself writing a fetch/API call, reconsider — all state is local.
3. **Dexie versioning:** Adding a field to an existing table requires a schema version bump with migration.
4. **Default drinks use negative IDs:** `useDrinks.ts` assigns IDs `-1, -2, ...` to `DEFAULT_DRINKS` from constants to avoid collisions with custom drink IDs from IndexedDB.
5. **30s recompute interval:** `useBACCalculation` only sets a tick timer when there are in-progress drinks. Completed session drinks use their recorded `finishedAt` timestamps.
6. **PWA service worker caching:** After production builds, cached assets may persist. Use `vite-plugin-pwa`'s auto-update strategy; do not manually manage the service worker.
7. **Chart.js registration:** All Chart.js components must be registered before use. See `BACGraph.tsx` for the existing pattern.

---

## Adding New Features

### New drink type
Add to `DEFAULT_DRINKS` in `src/lib/constants.ts` with a unique negative ID.

### New profile field
1. Add field to `Profile` interface in `src/db/schema.ts`
2. Bump Dexie version and write migration
3. Update `ProfileForm.tsx` to capture the field
4. Update `useBACCalculation.ts` if the field affects BAC computation

### New page/route
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add nav item in `AppShell.tsx`

### New utility function
Add to `src/lib/` as a pure function with corresponding tests in a `.test.ts` file alongside it.
