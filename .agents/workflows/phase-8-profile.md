---
description: # Faz 8 — Profil  **Ön koşul:** Faz 0 + 1 + 3 tamamlandı  **Amaç:** Kullanıcı profili, hedefler, ayarlar, istatistikler, vücut yağ hesaplayıcısı.
---

## Checkpoint 8.1 — Profil Bileşenleri

- [ ] `components/profile/ProfileSection.tsx`
  - Etiketli bölüm, sol kenarda accent çizgisi
  - Prop'lar: `title`, `children`

- [ ] `components/profile/StatCard.tsx`
  - Tek istatistik göstergesi
  - Prop'lar: `label`, `value`, `unit?`, `color?`

- [ ] `components/profile/GoalDisplay.tsx`
  - Mevcut hedef chip + günlük hedefler
  - Kalori | Protein | Karbonhidrat | Yağ | Bütçe
  - "Hedefi Değiştir" butonu

- [ ] `components/profile/BodyFatModal.tsx`
  - Alt sayfa modal
  - Navy formülü: bel, boyun, kalça (yalnızca kadın) — cm cinsinden
  - "Hesapla" butonu → sonuç + kategori rozeti
  - Kategoriler: Temel / Fit / Normal / Ortalamanın Üstü / Obez
  - "Profile Kaydet" butonu

**✓ Checkpoint 8.1 geçti:** Tüm bileşenler render ediliyor.

---

## Checkpoint 8.2 — Profil Ana Ekranı

- [ ] `app/(tabs)/profile/index.tsx`

  **Bölümler (sırayla):**

  1. **Avatar + İsim** — büyük, merkezde
  2. **Kişisel Bilgiler** — cinsiyet, yaş, boy, kilo, vücut yağ % ("Hesapla" linki ile)
  3. **Hedefler ve Hedef Değerler** — `GoalDisplay`, "Hedefi Değiştir" butonu
  4. **İstatistikler** — `StatCard` ızgarası:
     - Bu ay toplam harcama
     - Bu ay günlük ort. kalori
     - En çok pişirilen tarif
     - Toplam yakılan kalori
     - En uzun seri
  5. **Malzemelerim** — hızlı link (Faz 5 ile aynı ekran)
  6. **Ayarlar** — toggle'lar + zaman seçiciler:
     - Bildirim tercihleri (öğün hatırlatıcıları, kalori uyarısı, su, seri, haftalık özet)
     - Öğün hatırlatıcı zamanları (kahvaltı/öğle/akşam)
     - Su hatırlatıcısı aralığı + aktif saatler
     - Haftalık özet günü
     - Adım hedefi
     - Veri saklama süresi (varsayılan: 365 gün)
  7. **Sağlık Uygulaması** — bağlantı durumu + Bağlan/Bağlantıyı Kes butonu

  Her ayar değişikliğinde `useNotifications.scheduleAll()` çağır.

**✓ Checkpoint 8.2 geçti:** Profil bilgileri düzenlenebiliyor, ayarlar kaydediliyor, bildirimler yeniden zamanlanıyor.

---

## Checkpoint 8.3 — Hedef Değiştirme Akışı

Kullanıcı "Hedefi Değiştir"e bastığında:

- [ ] Onboarding Slide 4 + 6'ya benzer modal akışı aç
  - Hedef seçimi (tek seçim, mevcut önden seçili)
  - Aktivite seviyesi (mevcut önden seçili)
  - Önerilen hedefleri göster
  - "Önerileri Kullan" VEYA "Manuel Gir" toggle
  - Kaydet → `userStore.updateGoals()` + SQLite güncelle

**✓ Checkpoint 8.3 geçti:** Hedefi değiştirmek yeni kalori/makro hedeflerini günlük özette güncelliyor.

---

## Faz 8 Tamamlandı

**Kontrol et:**
- [ ] Profil bilgileri düzenlenip kaydedilebiliyor
- [ ] Vücut yağ hesaplayıcısı doğru sonuçlar veriyor
- [ ] İstatistikler gerçek DB verileri gösteriyor
- [ ] Ayarlar değiştiğinde bildirimler yeniden zamanlanıyor
- [ ] Hedef değiştirme günlük hedefleri güncelliyor

**Sonraki faz:** Faz 9 — Bildirimler ve Son Rötuşlar
