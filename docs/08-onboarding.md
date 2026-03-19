# 08 — Onboarding

## Overview

KaloriTabak shows a 7-slide onboarding flow on first launch. It simultaneously introduces the app's core features and collects the user's profile data needed for personalized calorie and macro calculations.

Onboarding is shown **once only**. After completion, `onboarding_completed` is set to `1` in SQLite and the user goes directly to the main tabs on all future launches.

---

## Flow Trigger

```typescript
// app/_layout.tsx — on app launch

const user = await getUser()

if (!user || user.onboarding_completed === 0) {
  router.replace('/(onboarding)')
} else {
  router.replace('/(tabs)')
}
```

---

## Slides

### Slide 1 — Welcome
**Route:** `/(onboarding)/index.tsx`
**Background gradient:** `#E3F2FD` → `#FAFAFA` (soft blue)

**Content:**
- KaloriTabak logo + app name animates in (fade + scale)
- Avatar waves hello (avatar-wave.json)
- Headline: **"Welcome to KaloriTabak! 🍽️"**
- Subtext: *"Let's get you set up. First things first — what's your name?"*
- Name text input (autofocus)
- Next button (disabled until name is at least 2 characters)

**Validation:**
- Name must be ≥ 2 characters
- Name is saved to local state (not yet written to DB)

**Progress:** 1 / 7

---

### Slide 2 — Cost Intro
**Route:** `/(onboarding)/slide2.tsx`
**Background gradient:** `#E8F5E9` → `#FAFAFA` (soft green)

**Content:**
- Avatar holds a shopping basket animation
- Headline: **"Do you know how much your meals cost?"**
- Subtext: *"KaloriTabak calculates the real-time cost of your recipes using live Migros prices. Know exactly what you're spending — every meal, every day."*
- Decorative: small animated price tag icons floating around avatar
- Next button

**Progress:** 2 / 7

---

### Slide 3 — Calorie Intro
**Route:** `/(onboarding)/slide3.tsx`
**Background gradient:** `#FFF3E0` → `#FAFAFA` (soft orange)

**Content:**
- Avatar holds a plate with food animation
- Headline: **"[Name], we make healthy eating simple."**
  - Name from Slide 1 inserted dynamically
- Subtext: *"Automatic calorie and macro tracking from real ingredients. No manual data entry — just pick your meal and we handle the numbers."*
- Next button

**Progress:** 3 / 7

---

### Slide 4 — Goal Selection
**Route:** `/(onboarding)/slide4.tsx`
**Background gradient:** `#FCE4EC` → `#FAFAFA` (soft pink)

**Content:**
- Avatar looks curious / thinking
- Headline: **"What brings you here?"**
- Subtext: *"Choose all that apply — we'll personalize your experience."*
- Multi-select goal chips (tap to toggle, visual feedback):

| Emoji | Label | Value |
|---|---|---|
| 🏋️ | I want to lose weight | `lose_weight` |
| 💪 | I want to gain weight | `gain_weight` |
| 🎯 | I want to stay fit | `stay_fit` |
| 🥗 | I want to eat healthier | `eat_healthy` |
| 💰 | I want to reduce food spending | `reduce_spending` |

- If multiple goals selected, app uses the first fitness-related goal for calorie calculations
- At least 1 selection required to proceed
- Next button

**Progress:** 4 / 7

---

### Slide 5 — Profile Info
**Route:** `/(onboarding)/slide5.tsx`
**Background gradient:** `#FAFAFA` → `#FAFAFA` (neutral)

**Content:**
- Avatar stands next to a measuring tape illustration
- Headline: **"Let's set your personal targets."**
- Subtext: *"This helps us calculate your daily calorie and macro goals. Stored only on your device."*
- Form fields:
  - **Gender** — toggle: Male / Female (required)
  - **Age** — number input, years (required)
  - **Height** — number input, cm (required)
  - **Weight** — number input, kg (required)
- All fields required to proceed
- Next button

**Validation:**
- Age: 10 – 120
- Height: 50 – 300 cm
- Weight: 20 – 500 kg

**Progress:** 5 / 7

---

### Slide 6 — Activity Level
**Route:** `/(onboarding)/slide6.tsx`
**Background gradient:** `#FAFAFA` → `#FAFAFA` (neutral)

**Content:**
- Headline: **"How active are you on a typical day?"**
- Subtext: *"Be honest — this directly affects your calorie target."*
- Single-select activity cards (large, icon + label + description):

| Icon | Label | Description | Multiplier |
|---|---|---|---|
| 🛋️ | Sedentary | Desk job, little to no exercise | × 1.2 |
| 🚶 | Lightly Active | Light exercise 1–3 days/week | × 1.375 |
| 🏃 | Moderately Active | Moderate exercise 3–5 days/week | × 1.55 |
| 💪 | Very Active | Hard exercise every day | × 1.725 |

- One option must be selected to proceed
- Selected card highlights with primary color border + checkmark
- Next button

**Progress:** 6 / 7

---

### Slide 7 — Ready
**Route:** `/(onboarding)/slide7.tsx`
**Background gradient:** `#E8F5E9` → `#FAFAFA` (green — success feeling)

**Content:**
- Avatar celebrates (avatar-celebrate.json — confetti burst)
- Headline: **"You're all set, [Name]! 🎉"**
- Subtext: *"Based on your profile, here are your daily targets:"*
- Calculated targets card (rounded card, primary border):

```
Your Goal:         Lose Weight
──────────────────────────────
Daily Calories:    1,650 kcal
Protein:           124g
Carbohydrates:     165g
Fat:               55g
──────────────────────────────
Daily Budget:      ₺ (not set yet — set in Profile)
```

- Small note: *"You can adjust these anytime in your Profile."*
- **"Let's get started!"** button (large, primary, full width)
  - On press: write all collected data to SQLite, set `onboarding_completed = 1`, navigate to `/(tabs)`

**Progress:** 7 / 7 (complete)

---

## Data Written to SQLite on Completion

All data collected across slides is held in local React state and written to the `user` table in a single transaction when "Let's get started!" is tapped:

```typescript
await db.runAsync(`
  INSERT INTO user (
    id, name, gender, age, height_cm, weight_kg,
    activity_level, goal,
    daily_calorie_goal, daily_protein_goal_g,
    daily_carbs_goal_g, daily_fat_goal_g,
    daily_step_goal, onboarding_completed
  ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10000, 1)
`, [
  name, gender, age, height, weight,
  activityLevel, primaryGoal,
  calorieGoal, proteinGoal, carbsGoal, fatGoal
])
```

---

## Calorie & Macro Calculation (Slide 7)

Calculated client-side in `utils/calorieCalc.ts` using the **Mifflin-St Jeor** formula:

```typescript
// Step 1: BMR
const bmr = gender === 'male'
  ? (10 * weight) + (6.25 * height) - (5 * age) + 5
  : (10 * weight) + (6.25 * height) - (5 * age) - 161

// Step 2: TDEE
const multipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
}
const tdee = bmr * multipliers[activityLevel]

// Step 3: Calorie goal based on selected goal
const calorieGoals = {
  lose_weight:      Math.round(tdee - 500),
  gain_weight:      Math.round(tdee + 500),
  stay_fit:         Math.round(tdee),
  eat_healthy:      Math.round(tdee),
  reduce_spending:  Math.round(tdee),   // no calorie restriction
}

// Step 4: Macro split
const macroSplits = {
  lose_weight:     { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain_weight:     { protein: 0.30, carbs: 0.50, fat: 0.20 },
  stay_fit:        { protein: 0.25, carbs: 0.50, fat: 0.25 },
  eat_healthy:     { protein: 0.25, carbs: 0.45, fat: 0.30 },
  reduce_spending: { protein: 0.25, carbs: 0.50, fat: 0.25 },
}

const split = macroSplits[goal]
const protein = Math.round((calorieGoal * split.protein) / 4)   // 4 kcal/g
const carbs   = Math.round((calorieGoal * split.carbs)   / 4)   // 4 kcal/g
const fat     = Math.round((calorieGoal * split.fat)     / 9)   // 9 kcal/g
```

---

## Navigation & Progress Dots

```typescript
// components/onboarding/SlideContainer.tsx

// Progress dots: 7 dots, current slide filled in primary color
// Back button: visible from slide 2 onward
// Next / CTA button: always bottom of screen, full width
// Slide transition: horizontal slide + fade (300ms)
```

---

## Skip / Back Behavior

- **No skip button** — all data is needed for personalization
- **Back button** available from slide 2 onwards
- Back navigation preserves previously entered data
- Tapping outside inputs does not dismiss the keyboard — user must tap "Next"

---

## Notification Permission Request

After onboarding completes and the user lands on the main tabs for the first time, a permission prompt for notifications is shown:

```typescript
// Triggered once, after first navigation to (tabs)
if (!notificationPermissionAsked) {
  const granted = await requestNotificationPermission()
  if (granted) {
    await rescheduleAllNotifications(defaultSettings)
  }
  markNotificationPermissionAsked()
}
```

This is shown **after** onboarding, not during — to avoid overwhelming the user with permission prompts during setup.
