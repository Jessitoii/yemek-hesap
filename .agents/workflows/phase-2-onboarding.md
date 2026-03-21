---
description: # Faz 2 — Onboarding ve Root Layout  **Ön koşul:** Faz 0 + Faz 1 tamamlandı  **Amaç:** Kullanıcı uygulamayı ilk açtığında karşılaştığı 7 slide'lık akış + root layout.
---

## Checkpoint 2.1 — Root Layout ve Yönlendirme

### Görevler

- [ ] `app/_layout.tsx`
  - Nunito font yükle (`useFonts`)
  - `db/index.ts` başlat — migration'ları çalıştır
  - `getUser()` → `onboarding_completed` kontrol et
  - `0` ise → `/(onboarding)` yönlendir
  - `1` ise → `/(tabs)` yönlendir
  - Bildirim handler'ı kur (`Notifications.setNotificationHandler`)
  - Arka planda cache temizliği başlat

- [ ] `app/(onboarding)/_layout.tsx`
  - Tab bar yok
  - `OnboardingContext` sağla — toplanan veriyi tüm slide'larda tut
  - Slide geçiş animasyonu (yatay slide + fade, 300ms)

**✓ Checkpoint 2.1 geçti:** Uygulama açılışta onboarding'e yönlendiriyor.

---

## Checkpoint 2.2 — Onboarding Bileşenleri

- [ ] `components/onboarding/SlideContainer.tsx`
  - İlerleme noktaları (7 nokta, aktif → primary renk)
  - Geri butonu (slide 2'den itibaren)
  - İleri/CTA butonu — validasyon geçene kadar disabled
  - Arka plan gradient (`expo-linear-gradient`)

- [ ] `components/onboarding/GoalOption.tsx`
  - Seçilebilir chip — emoji + etiket
  - Seçili → primary kenarlık + hafif dolgu

- [ ] `components/onboarding/ActivityLevelOption.tsx`
  - Büyük kart — ikon + başlık + açıklama
  - Seçili → primary kenarlık + checkmark

**✓ Checkpoint 2.2 geçti:** Bileşenler render ediliyor, seçim durumu çalışıyor.

---

## Checkpoint 2.3 — 7 Slide

Her slide `SlideContainer` içinde.

- [ ] `app/(onboarding)/index.tsx` — Slide 1: Karşılama
  - Avatar dalga animasyonu
  - İsim girişi (min 2 karakter)
  - Arka plan: `#E3F2FD → #FAFAFA`

- [ ] `app/(onboarding)/slide2.tsx` — Slide 2: Maliyet Tanıtımı
  - Alışveriş sepeti animasyonu
  - Arka plan: `#E8F5E9 → #FAFAFA`

- [ ] `app/(onboarding)/slide3.tsx` — Slide 3: Kalori Tanıtımı
  - Slide 1'den alınan ismi dinamik göster: "**[İsim]**, sağlıklı yemeyi kolaylaştırıyoruz."
  - Arka plan: `#FFF3E0 → #FAFAFA`

- [ ] `app/(onboarding)/slide4.tsx` — Slide 4: Hedef Seçimi
  - 5 seçenek, çoklu seçim (min 1 zorunlu)
  - Arka plan: `#FCE4EC → #FAFAFA`

- [ ] `app/(onboarding)/slide5.tsx` — Slide 5: Profil Bilgileri
  - Cinsiyet toggle, yaş, boy, kilo
  - Validasyon: yaş 10-120, boy 50-300, kilo 20-500
  - Arka plan: `#FAFAFA`

- [ ] `app/(onboarding)/slide6.tsx` — Slide 6: Aktivite Seviyesi
  - 4 büyük kart — tek seçim
  - Arka plan: `#FAFAFA`

- [ ] `app/(onboarding)/slide7.tsx` — Slide 7: Hazır
  - Kutlama animasyonu (avatar-celebrate.json)
  - Hesaplanan hedefleri göster (kaloriler, makrolar)
  - "Hadi Başlayalım!" → tüm veriyi SQLite'a tek transaction'la yaz → `/(tabs)` yönlendir
  - Arka plan: `#E8F5E9 → #FAFAFA`

**✓ Checkpoint 2.3 geçti:**
- 7 slide arası ileri/geri gezinme çalışıyor
- Validasyon hatalı girişleri engelliyor
- Slide 7'de SQLite'a yazma başarılı
- Sonraki açılışta `/(tabs)`'e yönlendiriyor (onboarding tekrar gösterilmiyor)

---

## Faz 2 Tamamlandı

**Kontrol et:**
- [ ] İlk açılış → onboarding görünüyor
- [ ] Tüm slide'lar arası gezinme çalışıyor
- [ ] Slide 7 sonrası `user` tablosunda veri var
- [ ] İkinci açılış → doğrudan `/(tabs)` (onboarding atlanıyor)
- [ ] Hesaplanan kalori/makro hedefleri mantıklı değerler gösteriyor

**Sonraki faz:** Faz 3 — Temel UI Bileşenleri
