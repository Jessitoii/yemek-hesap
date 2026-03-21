---
description: # Faz 7 — Aktivite  **Ön koşul:** Faz 0 + 1 + 3 tamamlandı  **Amaç:** Egzersiz kaydı, adım sayacı, seri takvimi, Health entegrasyonu.
---

## Checkpoint 7.1 — Aktivite Bileşenleri

- [ ] `components/activity/BurnedCaloriesRing.tsx`
  - Yakılan kalori için `ProgressRing` sarmalayıcı (adımlar + egzersiz)
  - `colors.pink` renk tonu

- [ ] `components/activity/StepsCard.tsx`
  - Büyük adım sayısı
  - Hedef ilerleme barı
  - "X adım kaldı" mesajı
  - Kaynak: Health uygulaması veya pedometer

- [ ] `components/activity/ExerciseCard.tsx`
  - Egzersiz ikonu | tip | süre | yakılan kalori
  - Sola kaydır → sil

- [ ] `components/activity/ExerciseTypeGrid.tsx`
  - 8 egzersiz tipi 2×4 grid'de
  - Seçilince vurgulanan ikon
  - 🏃 Koşu | 🚴 Bisiklet | 🏋️ Fitness | 🚶 Yürüyüş | 🏊 Yüzme | ⚽ Futbol | 🧘 Yoga | 🤸 Diğer

- [ ] `components/activity/StreakCalendar.tsx`
  - Aylık takvim
  - Tamamlanan günler: dolu yeşil daire
  - Kaçırılan günler: dolu kırmızı daire
  - Bugün: mavi çerçeveli daire
  - Gelecek günler: boş daire
  - Ay navigasyonu (← →)

**✓ Checkpoint 7.1 geçti:** Tüm bileşenler mock data ile render ediliyor.

---

## Checkpoint 7.2 — Aktivite Özet Ekranı

- [ ] `app/(tabs)/activity/index.tsx`
  - Önce profil kontrolü: boy/kilo eksikse → vurgulanan eksik alanlarla Profile yönlendir
  - Büyük `BurnedCaloriesRing` (merkez)
  - `StepsCard`
  - Bugünkü egzersizler listesi
  - "+ Egzersiz Ekle" butonu
  - Son 7 günün mini seri görünümü → "Tam Takvimi Gör" linki

**✓ Checkpoint 7.2 geçti:** Gerçek adım ve kalori verileri gösteriliyor.

---

## Checkpoint 7.3 — Egzersiz Ekleme

- [ ] `app/(tabs)/activity/add-exercise.tsx`
  - `ExerciseTypeGrid` — egzersiz tipi seç
  - Süre girişi (dakika)
  - Otomatik hesaplanan kalori önizlemesi: "X kg profilinize göre hesaplandı"
  - Notlar girişi (opsiyonel)
  - Kaydet → `activityStore.addExercise()` → özete geri dön

**✓ Checkpoint 7.3 geçti:** Egzersiz eklenince yakılan kalori günlük log'a yansıyor.

---

## Checkpoint 7.4 — Seri Takvimi

- [ ] `app/(tabs)/activity/streak.tsx`
  - Büyük seri rozeti: "🔥 X Gün"
  - En uzun seri: "En İyi: X gün"
  - Duruma göre avatar mesajı (0-3 / 7 / 30 gün eşiklerinde)
  - Tam aylık `StreakCalendar`

  **Seri tamamlanma mantığı:**
  - Günlük kalori hedefine ulaşıldı VE en az 1 egzersiz veya adım hedefi
  - Gece yarısında kontrol et, `streak` tablosuna yaz

**✓ Checkpoint 7.4 geçti:** Seri takvimi doğru günleri yeşil/kırmızı gösteriyor.

---

## Checkpoint 7.5 — Health Entegrasyonu

- [ ] İzin akışı: Aktivite tab'ı ilk açılışında
  - `services/health.ts` → izin iste
  - Verildi → Health app'ten adımları oku
  - Reddedildi → `usePedometer` fallback'e düş
- [ ] `StepsCard` veri kaynağını göster (Health / Pedometer / Manuel)
- [ ] Tüketilen kalori + egzersiz verisi Health app'e yaz (izin verildiyse)

**✓ Checkpoint 7.5 geçti:** Health bağlantısı çalışıyor, izin reddedilince pedometer'a düşüyor.

---

## Faz 7 Tamamlandı

**Kontrol et:**
- [ ] Egzersiz ekle → günlük yakılan kalori güncelleniyor
- [ ] Adım sayacı Health veya pedometer'dan gerçek veri okuyor
- [ ] Seri takvimi tamamlanan günleri doğru işaretliyor
- [ ] Profil eksikse Aktivite ekranı Profile yönlendiriyor

**Sonraki faz:** Faz 8 — Profil
