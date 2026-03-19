# 06 — UI Design

## Design Philosophy

KaloriTabak is designed to feel **friendly, approachable, and motivating** — not clinical or intimidating. The visual language draws inspiration from apps like Duolingo: playful illustrations, a mascot character, rewarding animations, and a light pastel color palette that feels warm rather than sterile.

Key principles:
- **Light theme only** — no dark mode
- **Soft and rounded** — large border radii, no sharp edges
- **Colorful but not overwhelming** — pastels with strategic accent pops
- **Animated and alive** — progress rings fill, prices animate, avatar reacts
- **Consistent spacing** — 8px grid system throughout

---

## Color Palette

### Primary Colors

```typescript
// constants/colors.ts

export const colors = {
  // Primary — Light Blue
  primary:          '#4FC3F7',
  primaryLight:     '#B3E5FC',
  primaryDark:      '#0288D1',

  // Secondary — Light Green
  secondary:        '#81C784',
  secondaryLight:   '#C8E6C9',
  secondaryDark:    '#388E3C',

  // Accent — Orange
  accent:           '#FFB74D',
  accentLight:      '#FFE0B2',
  accentDark:       '#F57C00',

  // Pink
  pink:             '#F48FB1',
  pinkLight:        '#FCE4EC',
  pinkDark:         '#C2185B',

  // Bordo
  bordo:            '#C62828',
  bordoLight:       '#FFCDD2',
  bordoDark:        '#B71C1C',

  // Neutrals
  background:       '#FAFAFA',
  surface:          '#FFFFFF',
  surfaceAlt:       '#F5F5F5',
  border:           '#E0E0E0',
  borderLight:      '#F0F0F0',

  // Text
  textPrimary:      '#212121',
  textSecondary:    '#757575',
  textDisabled:     '#BDBDBD',
  textOnPrimary:    '#FFFFFF',

  // Semantic
  success:          '#66BB6A',
  warning:          '#FFA726',
  error:            '#EF5350',
  info:             '#42A5F5',

  // Calorie ring states
  calorieUnder:     '#81C784',
  calorieNear:      '#FFB74D',
  calorieOver:      '#EF5350',

  // Price change indicators
  priceUp:          '#EF5350',
  priceDown:        '#66BB6A',
  priceUnchanged:   '#BDBDBD',
}
```

### Color Usage Guide

| Element | Color |
|---|---|
| Primary buttons | `primary` (#4FC3F7) |
| Success states, calorie under goal | `secondary` (#81C784) |
| Warnings, near calorie goal | `accent` (#FFB74D) |
| Errors, over calorie goal, price up | `error` (#EF5350) |
| Favorites, streak fire | `pink` (#F48FB1) |
| Delete actions, alerts | `bordo` (#C62828) |
| Page backgrounds | `background` (#FAFAFA) |
| Cards, modals | `surface` (#FFFFFF) |
| Tab bar, secondary sections | `surfaceAlt` (#F5F5F5) |

---

## Typography

```typescript
// constants/typography.ts

export const typography = {
  fontRegular:    'Nunito-Regular',
  fontMedium:     'Nunito-Medium',
  fontSemiBold:   'Nunito-SemiBold',
  fontBold:       'Nunito-Bold',
  fontExtraBold:  'Nunito-ExtraBold',

  xs:    10,
  sm:    12,
  base:  14,
  md:    16,
  lg:    18,
  xl:    20,
  xxl:   24,
  xxxl:  28,
  hero:  36,
}
```

**Font choice: Nunito**
Rounded, friendly, highly legible at small sizes. Matches the playful tone without being childish. Available via `@expo-google-fonts/nunito`.

### Text Hierarchy

| Role | Size | Weight |
|---|---|---|
| Hero number (calorie ring center) | 36 | ExtraBold |
| Screen title | 24 | Bold |
| Section header | 18 | SemiBold |
| Card title | 16 | SemiBold |
| Body text | 14 | Regular |
| Caption / label | 12 | Medium |
| Micro label | 10 | Medium |

---

## Spacing & Layout

```typescript
// constants/theme.ts

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
}

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
}

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

---

## Components

### Buttons

```
Primary Button:
  Background: primary (#4FC3F7)
  Text: white, 16px SemiBold
  Border radius: full (pill shape)
  Padding: 14px vertical, 24px horizontal
  Shadow: sm
  Press animation: scale 0.97 + slight darken

Secondary Button:
  Background: white
  Border: 1.5px solid primary
  Text: primary, 16px SemiBold
  Border radius: full

Ghost Button:
  Background: transparent
  Text: textSecondary, 14px Medium
  No border, no shadow
```

### Cards

```
Base Card:
  Background: surface (#FFFFFF)
  Border radius: lg (16px)
  Shadow: sm
  Padding: 16px

Recipe Card:
  Image: top, full width, height 160px, radius top lg
  Name: 16px SemiBold
  Stats row: cost (accent) | calories (primary) | servings (secondary)
  Heart icon: top right overlay

Ingredient Row:
  Left: 48x48 product image, radius md
  Center: name (14px SemiBold) + quantity (12px secondary)
  Right: cost (14px accent Bold) + calories (12px primary)
```

### Progress Components

```
Progress Ring (Calorie):
  Size: 180px diameter
  Stroke width: 14px
  Background track: borderLight
  Fill color:
    under goal  → secondary (green)
    near goal   → accent (orange)
    over goal   → error (red)
  Center text: consumed kcal (hero) + "/ goal kcal" (sm)
  Animation: spring on value change

Progress Bar (Macros):
  Height: 8px
  Border radius: full
  Background: borderLight
  Fill colors:
    Protein  → primary (#4FC3F7)
    Carbs    → accent (#FFB74D)
    Fat      → pink (#F48FB1)
  Label: "Protein: 80g / 124g" above bar
  Animation: width animates on value change

Progress Bar (Streak / Steps):
  Height: 12px
  Border radius: full
  Fill: secondary (green)
  Animation: width animates on load
```

### Tab Bar

```
Background: surface (#FFFFFF)
Border top: 1px borderLight
Height: 60px

Tab colors:
  Recipes   → primary (#4FC3F7)
  Daily     → secondary (#81C784)
  Discover  → accent (#FFB74D)
  Activity  → pink (#F48FB1)
  Profile   → bordo (#C62828)

Active: colored icon + colored label (11px SemiBold) + small dot indicator
Inactive: textDisabled icon + textDisabled label
```

---

## Avatar (KaloriTabak Mascot)

### Concept
A small, round, Duolingo-style character. Friendly face, chef hat, holding a fork. Expresses emotions through simple facial animations. Clean vector style — no unnecessary detail.

### Design Specs
- Round body
- Chef hat in primary blue (#4FC3F7)
- Warm skin tone, big eyes, simple mouth
- Expressions conveyed through eyes + mouth only
- Lottie-animated for smooth transitions

### Usage Contexts

| Screen | Avatar State | Message |
|---|---|---|
| Onboarding slides | Waving / excited | Welcome messages |
| Slide 7 — Ready | Celebrating (confetti) | "You're in the right place!" |
| Empty states | Neutral / encouraging | "No recipes yet, let's add some!" |
| Calorie goal reached | Celebrating | "Amazing! You hit your goal today! 🎉" |
| Calorie goal exceeded | Sad / encouraging | "Over the limit today — tomorrow is a new day!" |
| Streak milestone (7, 30 days) | Excited / party | "One week strong! Keep going!" |
| Streak broken | Sad | "Aw, the streak ended. Start fresh today!" |
| Meal plan generating | Thinking (loading) | "Finding the perfect plan for you..." |
| Recipe suggestion | Pointing | "Based on your remaining calories, try this!" |

### Lottie Animation Files

```
assets/animations/
├── avatar-idle.json        ← gentle floating bob (loop)
├── avatar-celebrate.json   ← jumps + confetti burst
├── avatar-sad.json         ← drooping + slow shake
├── avatar-thinking.json    ← finger on chin + question mark
├── avatar-wave.json        ← waving hello
└── avatar-point.json       ← pointing right (for suggestions)
```

---

## Animations

### Principles
- `react-native-reanimated` for all animations
- Spring animations for interactive/touch elements
- Timing animations for data-driven fills
- Max 600ms for UI feedback animations
- Celebration animations up to 1500ms

### Key Animations

**Price Change (Recipe Detail — "Update Prices")**
1. Each ingredient row briefly highlights
2. New price value slides in from the right
3. Diff badge fades in: ↑ +X.XX TL (red) or ↓ -X.XX TL (green)
4. Duration: 400ms per row, staggered 50ms apart

**Calorie Ring Fill**
- On screen load: animates from 0 → current value (600ms, spring)
- On new meal added: animates to new value (400ms, spring)
- Color: smooth transition green → orange → red as value changes

**Streak Day Completion**
- Newly completed day: scale bounce (1.0 → 1.3 → 1.0) + green fill
- Streak milestone reached: avatar celebration overlay (full screen, tap to dismiss)

**Random Recipe Flip (Discover)**
- Card flips 360° on Y axis (500ms, ease-in-out)
- New recipe content appears on the back face

**Onboarding Slide Transitions**
- Forward: slide left + fade out / slide in from right + fade in (300ms)
- Back: reverse
- Avatar floats up from bottom on first render of each slide (400ms, spring)

---

## Iconography

**Library: Phosphor Icons** (`phosphor-react-native`)
Rounded style, consistent stroke weight, large library. Matches app's friendly aesthetic.

### Key Icons

```
Navigation:
  Recipes tab     → BookOpen
  Daily tab       → CalendarCheck
  Discover tab    → Compass
  Activity tab    → Lightning
  Profile tab     → UserCircle

Actions:
  Add             → Plus (in circle)
  Search          → MagnifyingGlass
  Filter          → SlidersHorizontal
  Favorite        → Heart (filled when active)
  Delete          → Trash
  Edit            → PencilSimple
  Back            → ArrowLeft
  Close           → X
  Camera          → Camera
  Gallery         → Image
  Refresh prices  → ArrowsClockwise

Activity:
  Running         → PersonSimpleRun
  Cycling         → Bicycle
  Fitness         → Barbell
  Walking         → PersonSimpleWalk
  Swimming        → Waves
  Steps           → Footprints
  Fire (streak)   → Fire
  Water           → Drop
```

---

## Screen-Level Design Notes

### Daily Summary
- Calorie ring is the hero — large (180px), centered at top
- Macro bars below ring, compact (8px height)
- Meal sections collapse/expand accordion style
- Suggestion card has a soft gradient left border in primary blue

### Discover Feed
- Section headers: small left accent bar in primary color
- Calorie range grid: food emojis as visual anchors, no photos needed
- Cuisine cards: semi-transparent dark gradient overlay on photo for text legibility
- Random recipe card: slightly elevated with stronger shadow to stand out

### Streak Calendar
- Completed days: filled circle, secondary green
- Missed days: filled circle, bordoLight
- Today: outlined circle, primary blue
- Future days: empty circle, borderLight
- Streak count: fire emoji + hero-sized number + "day streak" label

### Onboarding Slide Backgrounds
Each slide has a soft full-screen gradient (top → bottom):

| Slide | Gradient |
|---|---|
| 1 — Welcome | `#E3F2FD` → `#FAFAFA` (blue tint) |
| 2 — Cost intro | `#E8F5E9` → `#FAFAFA` (green tint) |
| 3 — Calorie intro | `#FFF3E0` → `#FAFAFA` (orange tint) |
| 4 — Goal selection | `#FCE4EC` → `#FAFAFA` (pink tint) |
| 5 — Profile info | `#FAFAFA` → `#FAFAFA` (neutral) |
| 6 — Activity level | `#FAFAFA` → `#FAFAFA` (neutral) |
| 7 — Ready | `#E8F5E9` → `#FAFAFA` (green — success feeling) |
