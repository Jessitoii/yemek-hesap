---
description: # Faz 4 — Günlük Takip  **Ön koşul:** Faz 0 + 1 + 3 tamamlandı  **Amaç:** Uygulamanın kalbi. Kullanıcı her gün bu ekranı kullanır — öğün kaydı, kalori takibi, harcama, makro özet.
---

## Checkpoint 4.1 — Günlük Özet Bileşenleri

- [ ] `components/daily/CalorieRing.tsx`
  - Büyük (180px) `ProgressRing` sarmalayıcı
  - Merkez: tüketilen kcal (hero boyut) + "/ hedef kcal" (küçük)
  - Renk: `calorieUnder` → `calorieNear` → `calorieOver` (%90/%100 eşiklerinde)
  - Yüklenirken 0'dan hedefe spring animasyonu

- [ ] `components/daily/DailyStatsRow.tsx`
  - 4 istatistik yan yana: 🔥 kalori | 💰 harcama | 👟 adım | 🏃 yakılan
  - Her biri: ikon + değer + etiket
  - Yatay ScrollView'da (küçük ekranlar için)

- [ ] `components/daily/MacroSummary.tsx`
  - 3 `ProgressBar`: Protein (primary) | Karbonhidrat (accent) | Yağ (pink)
  - Her bar: "Protein: 80g / 124g" etiketi
  - Değer değiştiğinde animasyon

- [ ] `components/daily/MealSection.tsx`
  - Prop'lar: `mealType`, `items`, `onAddPress`
  - Başlık: öğün adı + subtoplam kalori
  - Akordeon aç/kapat
  - `MealItemRow` listesi
  - Alt "+" butonu

- [ ] `components/daily/MealItemRow.tsx`
  - Prop'lar: `meal`, `onDelete`
  - Görsel | isim + miktar | kalori | maliyet
  - Sola kaydır → sil

- [ ] `components/daily/RecipeSuggestionCard.tsx`
  - Tarif görseli + isim + kalori + maliyet
  - "Günlüğe Ekle" butonu
  - Hedef aşıldıysa gizle → avatar motivasyon mesajı göster

**✓ Checkpoint 4.1 geçti:** Tüm bileşenler mock data ile render ediliyor.

---

## Checkpoint 4.2 — Günlük Özet Ekranı

- [ ] `app/(tabs)/daily/index.tsx`
  - Tarih seçici (← bugün →), SwipeGesture ile değiştirilebilir
  - `useDailyStore` ile günlük veri yükle
  - Bölümler sırayla: CalorieRing → DailyStatsRow → MacroSummary → RecipeSuggestionCard → MealSection x4
  - `ScrollView` — tüm içerik kaydırılabilir
  - Her `MealSection`'da "+" → `add-meal` ekranına git

**✓ Checkpoint 4.2 geçti:** Gerçek günlük veri gösteriliyor, öğün bölümleri doğru kalori toplamlarıyla.

---

## Checkpoint 4.3 — Öğün Ekleme Ekranı

- [ ] `app/(tabs)/daily/add-meal.tsx`
  - Üst: öğün tipi seçici (Kahvaltı / Öğle / Akşam / Atıştırmalık)
  - İki sekme: "Tariflerim" | "Yiyecek Ara"
  - Tariflerim: `recipesStore`'dan liste, seçince porsiyon seç
  - Yiyecek Ara: `useMigrosSearch` + OpenFoodFacts, miktar + birim gir
  - Canlı önizleme: "≈ X kcal | ≈ ₺X.XX"
  - "Ekle" → `dailyStore.addMeal()` → günlük özete geri dön

**✓ Checkpoint 4.3 geçti:** Tarif ve yiyecek arama ile öğün eklenebiliyor, günlük toplamlar güncelleniyor.

---

## Checkpoint 4.4 — Geçmiş Ekranı

- [ ] `app/(tabs)/daily/history.tsx`
  - Aylık takvim görünümü
  - Her gün: küçük renkli nokta (yeşil/turuncu/kırmızı/gri)
  - Güne dokunma → o günün özeti inline açılır
  - Haftalık grafik: son 7 günün kalori çubuk grafiği (victory-native)
  - Haftalık grafik: son 7 günün harcama çubuk grafiği
  - Aylık özet: ort. günlük kalori, toplam harcama, en uzun seri

**✓ Checkpoint 4.4 geçti:** Geçmiş veriler takvimde renkli noktalarla görünüyor, grafikler gerçek veri gösteriyor.

---

## Faz 4 Tamamlandı

**Kontrol et:**
- [ ] Öğün ekle → kalori halkası animasyonla güncelleniyor
- [ ] Hedefin %90'ına gelince renk turuncu oluyor
- [ ] Hedef aşılınca tarif önerisi kayboluyor
- [ ] Geçmiş günlere gidip o günün öğünlerini görebiliyorsun
- [ ] Tarih seçicide farklı günlere geçiş çalışıyor

**Sonraki faz:** Faz 5 — Tarifler
