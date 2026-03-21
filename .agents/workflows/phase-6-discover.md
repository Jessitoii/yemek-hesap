---
description: # Faz 6 — Keşfet  **Ön koşul:** Faz 0 + 1 + 3 + 5 tamamlandı (tarif altyapısı hazır olmalı)  **Amaç:** TheMealDB'den tarif keşfi, kategori/mutfak filtreleme, rastgele tarif, öğün planı oluşturma.
---

## Checkpoint 6.1 — Keşfet Bileşenleri

- [ ] `components/discover/DiscoverCard.tsx`
  - Keşfet feed'i için tarif kartı
  - Görsel | isim | kalori | mutfak etiketi
  - Favori ikonu

- [ ] `components/discover/CategoryChip.tsx`
  - Emoji + etiket pill şekli
  - Seçili → `colors.primary` arka plan

- [ ] `components/discover/CalorieRangeCard.tsx`
  - 2×3 grid için kart
  - Yemek emoji + "X-Y kcal" etiketi
  - Üzerine hafif renk tonu

- [ ] `components/discover/CuisineCard.tsx`
  - Büyük yatay kart + gerçek yemek fotoğrafı
  - Yarı saydam koyu gradient overlay (metin okunabilirliği için)
  - Mutfak adı + tarif sayısı

- [ ] `components/discover/RandomRecipeCard.tsx`
  - Kart çevirme animasyonu (Y ekseninde 360°, 500ms)
  - "Başka öneri?" butonu

- [ ] `components/discover/FilterPanel.tsx`
  - Alt sayfa modal
  - Kategori (çoklu seçim), Mutfak (çoklu seçim)
  - Kalori aralığı slider (0–1000+ kcal)
  - Maliyet aralığı slider (₺0–₺500+)
  - Makro tipi chip'leri: Yüksek Protein / Düşük Karbonhidrat / Vegan vb.
  - Sıralama: İlgili / En Az Kalori / En Çok Kalori / En Ucuz / En Pahalı
  - "Filtrele" + "Sıfırla"

**✓ Checkpoint 6.1 geçti:** Tüm bileşenler mock data ile render ediliyor.

---

## Checkpoint 6.2 — Keşfet Feed Ekranı

- [ ] `app/(tabs)/discover/index.tsx`
  - İki sekme: KEŞFET | FAVORİLER

  **KEŞFET sekmesi:**
  - Arama çubuğu (TheMealDB araması, submit ile)
  - Popüler Kategoriler (yatay kaydırma)
  - Kaloriye Göre (2×3 grid)
  - Dünyadan Lezzetler (yatay kaydırma, büyük mutfak kartları)
  - Öğün Seç (Kahvaltı / Öğle / Akşam / Atıştırmalık kartları)
  - "Bugün Ne Pişirsem?" bölümü — rastgele tarif + çevirme animasyonu

  **FAVORİLER sekmesi:**
  - Favori tariflerin grid görünümü
  - Boş durum: Avatar + "Henüz favori yok" + "Keşfetmeye Başla" butonu

**✓ Checkpoint 6.2 geçti:** Feed yükleniyor, kategorilere tıklanabiliyor, rastgele tarif çevirme çalışıyor.

---

## Checkpoint 6.3 — Keşfet Tarif Detayı

- [ ] `app/(tabs)/discover/[id].tsx`
  - `app/(tabs)/recipes/[id].tsx` ile aynı layout
  - **Fark:** Alt bar → "Tariflerime Ekle" (birincil) + "Günlüğe Ekle" (ikincil)
  - "Düzenle" yok (kullanıcının tarifi değil)

**✓ Checkpoint 6.3 geçti:** Keşfet'ten tarif detayına gidip "Tariflerime Ekle" çalışıyor.

---

## Checkpoint 6.4 — Öğün Planı Oluşturucu

- [ ] `app/(tabs)/discover/meal-plan.tsx`
  - Giriş: Kalori hedefi (profilden önceden dolu) + Günlük bütçe + Süre (1/3/7 gün)
  - "Plan Oluştur" butonu
  - Yükleme: avatar düşünen animasyonu
  - Plan sonucu: gün bazlı layout, her gün 4 öğün
  - Her öğün: tarif görseli + adı + kalori + maliyet
  - Günlük toplamlar
  - "Bu Planı Uygula" → tüm öğünleri günlük log'a ekle
  - "Yeniden Oluştur" butonu

  **Plan oluşturma mantığı:**
  - ≥10 kaydedilmiş tarif varsa → kural motoru (`utils/recipeSuggestion.ts`)
  - <10 tarif varsa → Cerebras API fallback
  - Her ikisi de başarısız → hata mesajı göster

**✓ Checkpoint 6.4 geçti:** Plan oluşturuluyor, "Planı Uygula" ile günlük log güncelleniyor.

---

## Faz 6 Tamamlandı

**Kontrol et:**
- [ ] Feed tüm bölümlerle yükleniyor
- [ ] Filtre paneli çalışıyor, sonuçlar filtreleniyor
- [ ] Rastgele tarif çevirme animasyonu sorunsuz
- [ ] Keşfet'ten tarife "Tariflerime Ekle" çalışıyor
- [ ] Öğün planı oluşturuluyor ve günlüğe uygulanabiliyor

**Sonraki faz:** Faz 7 — Aktivite
