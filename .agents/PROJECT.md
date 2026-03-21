# KaloriTabak — Proje Durumu

Bu dosya agent'ın her session başında okuması gereken tek kaynak. Ne yapıldı, ne yapılacak, hangi sırayla — hepsi burada.

---

## Proje Özeti

**KaloriTabak** — Türkiye'ye özel yemek maliyet + kalori takip uygulaması.
- Expo + React Native (iOS & Android)
- Sıfır backend, sıfır sunucu maliyeti
- Tüm veri cihazda SQLite'ta saklanır
- Gerçek zamanlı Migros fiyatları + TheMealDB tarifleri

**Tüm teknik detaylar:** `docs/` klasöründe
| Dosya | İçerik |
|---|---|
| `docs/01-features.md` | Tüm özellikler + edge case'ler |
| `docs/02-architecture.md` | Mimari + veri akışı |
| `docs/03-screens.md` | Tüm ekranlar + UI detayları |
| `docs/04-database.md` | SQLite şemaları |
| `docs/05-folder-structure.md` | Klasör yapısı |
| `docs/06-ui-design.md` | Renkler + tipografi + avatar |
| `docs/07-notifications.md` | Bildirim sistemi |
| `docs/08-onboarding.md` | Onboarding akışı |
| `docs/09-api-integrations.md` | Tüm API'ler + kullanım |

---

## Geliştirme Öncelikleri (Sıralı)

Aşağıdaki sırayı takip et. Bir katman tamamlanmadan bir sonrakine geçme.

### Katman 0 — Proje İskeleti (İLK YAPILACAK)
Her şeyin temeli. Bitmeden hiçbir özellik yazılamaz.

- [x] `package.json` — tüm dependency'lerle
- [x] `app.json` — Expo config
- [x] `eas.json` — EAS Build config
- [x] `tsconfig.json` — path alias'lar (`@/` → root)
- [x] `.env.example` — gerekli API key'lerin listesi
- [x] `constants/colors.ts` — renk paleti (`docs/06-ui-design.md`)
- [x] `constants/typography.ts` — font tanımları
- [x] `constants/theme.ts` — spacing, radius, shadow token'ları
- [x] `constants/exercises.ts` — egzersiz tipleri + MET değerleri
- [x] `constants/routes.ts` — typed route sabitleri
- [x] `types/` — tüm TypeScript tip tanımları (user, recipe, ingredient, daily, activity, mealPlan, api)
- [x] `utils/uuid.ts` — `generateId()` helper
- [x] `utils/densityTable.ts` — 150+ malzeme gram eşdeğerleri
- [x] `utils/unitConverter.ts` — birim → gram dönüşümü
- [x] `utils/calorieCalc.ts` — BMR, TDEE hesaplamaları
- [x] `utils/macroCalc.ts` — makro hedefleri
- [x] `utils/bodyFatCalc.ts` — Navy formula
- [x] `utils/exerciseCalc.ts` — egzersiz kalori hesabı
- [x] `utils/recipeSuggestion.ts` — akıllı tarif önerisi mantığı
- [x] `utils/priceCalc.ts` — maliyet hesaplamaları
- [x] `utils/formatters.ts` — para, kalori, tarih formatlayıcılar
- [x] `db/index.ts` — SQLite bağlantısı + migration runner
- [x] `db/migrations/` — 001'den 011'e tüm migration'lar
- [x] `db/queries/` — tüm typed query fonksiyonları

### Katman 1 — Store & Servisler
UI olmadan test edilebilir katman.

- [ ] `stores/userStore.ts`
- [ ] `stores/recipesStore.ts`
- [ ] `stores/dailyStore.ts`
- [ ] `stores/activityStore.ts`
- [ ] `services/migros.ts`
- [ ] `services/themealdb.ts`
- [ ] `services/openfoodfacts.ts`
- [ ] `services/usda.ts`
- [ ] `services/mymemory.ts`
- [ ] `services/unsplash.ts`
- [ ] `services/ddgs.ts`
- [ ] `services/cerebras.ts`
- [ ] `services/health.ts`
- [ ] `hooks/useMigrosSearch.ts`
- [ ] `hooks/useTranslate.ts`
- [ ] `hooks/useNutrition.ts`
- [ ] `hooks/usePedometer.ts`
- [ ] `hooks/useNotifications.ts`
- [ ] `hooks/useHealthKit.ts`

### Katman 2 — Onboarding
İlk açılışta gösterilecek 7 slide.

- [ ] `app/(onboarding)/_layout.tsx`
- [ ] `app/(onboarding)/index.tsx` — slide 1: karşılama + isim
- [ ] `app/(onboarding)/slide2.tsx` — maliyet tanıtımı
- [ ] `app/(onboarding)/slide3.tsx` — kalori tanıtımı
- [ ] `app/(onboarding)/slide4.tsx` — hedef seçimi
- [ ] `app/(onboarding)/slide5.tsx` — profil bilgileri
- [ ] `app/(onboarding)/slide6.tsx` — aktivite seviyesi
- [ ] `app/(onboarding)/slide7.tsx` — hazır ekranı
- [ ] `components/onboarding/SlideContainer.tsx`
- [ ] `components/onboarding/GoalOption.tsx`
- [ ] `components/onboarding/ActivityLevelOption.tsx`

### Katman 3 — Temel UI Bileşenleri
Tüm ekranlar bu bileşenleri kullanır.

- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Input.tsx`
- [ ] `components/ui/Modal.tsx`
- [ ] `components/ui/Badge.tsx`
- [ ] `components/ui/Chip.tsx`
- [ ] `components/ui/Divider.tsx`
- [ ] `components/ui/EmptyState.tsx`
- [ ] `components/ui/LoadingSpinner.tsx`
- [ ] `components/ui/ProgressBar.tsx`
- [ ] `components/ui/ProgressRing.tsx`
- [ ] `components/ui/Avatar.tsx`
- [ ] `components/ui/Toast.tsx`

### Katman 4 — Tab: Günlük Takip (Daily)
En kritik özellik. Önce bunu yap.

- [ ] `app/(tabs)/daily/index.tsx` — günlük özet
- [ ] `app/(tabs)/daily/add-meal.tsx` — öğün ekle
- [ ] `app/(tabs)/daily/history.tsx` — geçmiş takvim
- [ ] `components/daily/CalorieRing.tsx`
- [ ] `components/daily/DailyStatsRow.tsx`
- [ ] `components/daily/MealSection.tsx`
- [ ] `components/daily/MealItemRow.tsx`
- [ ] `components/daily/MacroSummary.tsx`
- [ ] `components/daily/RecipeSuggestionCard.tsx`

### Katman 5 — Tab: Tarifler (Recipes)

- [ ] `app/(tabs)/recipes/index.tsx` — tarif listesi
- [ ] `app/(tabs)/recipes/[id].tsx` — tarif detay
- [ ] `app/(tabs)/recipes/new.tsx` — yeni tarif
- [ ] `app/(tabs)/recipes/ingredient-match.tsx` — Migros eşleştirme
- [ ] `app/(tabs)/recipes/my-ingredients/index.tsx`
- [ ] `app/(tabs)/recipes/my-ingredients/[id].tsx`
- [ ] `components/recipes/RecipeCard.tsx`
- [ ] `components/recipes/RecipeDetailHeader.tsx`
- [ ] `components/recipes/IngredientRow.tsx`
- [ ] `components/recipes/IngredientMatchList.tsx`
- [ ] `components/recipes/MigrosProductCard.tsx`
- [ ] `components/recipes/QuantityInput.tsx`
- [ ] `components/recipes/PriceHistory.tsx`
- [ ] `components/recipes/MacroBar.tsx`
- [ ] `components/recipes/FavoriteButton.tsx`

### Katman 6 — Tab: Keşfet (Discover)

- [ ] `app/(tabs)/discover/index.tsx` — keşfet feed
- [ ] `app/(tabs)/discover/[id].tsx` — tarif detay
- [ ] `app/(tabs)/discover/meal-plan.tsx` — öğün planı
- [ ] `components/discover/DiscoverCard.tsx`
- [ ] `components/discover/CategoryChip.tsx`
- [ ] `components/discover/CalorieRangeCard.tsx`
- [ ] `components/discover/CuisineCard.tsx`
- [ ] `components/discover/RandomRecipeCard.tsx`
- [ ] `components/discover/FilterPanel.tsx`

### Katman 7 — Tab: Aktivite (Activity)

- [ ] `app/(tabs)/activity/index.tsx` — aktivite özet
- [ ] `app/(tabs)/activity/add-exercise.tsx` — egzersiz ekle
- [ ] `app/(tabs)/activity/streak.tsx` — seri takvimi
- [ ] `components/activity/BurnedCaloriesRing.tsx`
- [ ] `components/activity/StepsCard.tsx`
- [ ] `components/activity/ExerciseCard.tsx`
- [ ] `components/activity/ExerciseTypeGrid.tsx`
- [ ] `components/activity/StreakCalendar.tsx`

### Katman 8 — Tab: Profil (Profile)

- [ ] `app/(tabs)/profile/index.tsx` — profil ana
- [ ] `components/profile/ProfileSection.tsx`
- [ ] `components/profile/StatCard.tsx`
- [ ] `components/profile/GoalDisplay.tsx`
- [ ] `components/profile/BodyFatModal.tsx`

### Katman 9 — Root Layout & Tab Bar

- [x] `app/_layout.tsx` — root layout (font yükleme, DB init, bildirim setup)
- [x] `app/(tabs)/_layout.tsx` — tab bar konfigürasyonu

### Katman 10 — Bildirimler & Health

- [ ] Bildirim zamanlayıcıları (öğün, su, seri uyarısı, haftalık özet)
- [ ] Apple HealthKit entegrasyonu (iOS)
- [ ] Google Health Connect entegrasyonu (Android)

---

## Önemli Kararlar & Kısıtlamalar

1. **Migros API gayri-resmidir** — endpoint değişebilir, her zaman try/catch içinde kullan
2. **MyMemory günlük 1000 istek limiti** — çeviri her zaman SQLite cache'den önce kontrol edilmeli
3. **USDA DEMO_KEY** — günlük 50 istek, sadece fallback olarak kullan, her zaman cache'le
4. **Health integration EAS Build gerektirir** — standart `expo start` ile çalışmaz
5. **Tüm fiyatlar kuruş cinsinden saklanır** — sadece gösterimde TL'ye çevir
6. **Tüm tarihler `YYYY-MM-DD` string formatında** — SQLite DATE tipi yok
7. **Tüm ID'ler UUID** — `utils/uuid.ts`'den `generateId()` kullan

---

## Nasıl Kullanılır

**Yeni özellik eklerken:**
1. Bu dosyayı oku — hangi katmanda olduğunu belirle
2. Katmanın tüm bağımlılıkları tamamlandı mı kontrol et
3. İlgili `docs/` dosyasını oku
4. İlgili skill'i uygula
5. Bu dosyadaki checkbox'ı işaretle

**Mevcut dosyaları düzenlerken:**
1. Önce dosyayı oku
2. Mimari kuralları ihlal ediyor musun kontrol et (`rules.md`)
3. Düzeni yap

**Bir şeyden emin değilsen:**
- Mimari → `docs/02-architecture.md`
- Ekran tasarımı → `docs/03-screens.md`
- Veritabanı → `docs/04-database.md`
- UI/renk → `docs/06-ui-design.md`