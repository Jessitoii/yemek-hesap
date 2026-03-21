---
description: # Faz 5 — Tarifler  **Ön koşul:** Faz 0 + 1 + 3 tamamlandı  **Amaç:** Tarifleri kaydet, düzenle, maliyet hesapla, Migros fiyatlarıyla eşleştir.
---

## Checkpoint 5.1 — Tarif Bileşenleri

- [ ] `components/recipes/RecipeCard.tsx`
  - Görsel (rounded top) | isim | porsiyon başına maliyet | porsiyon başına kalori | porsiyon sayısı
  - Sağ üst: ❤️ favori ikonu (FavoriteButton)
  - Sola kaydır → sil

- [ ] `components/recipes/FavoriteButton.tsx`
  - Toggle: boş kalp → dolu kalp (spring animasyonu)
  - `recipesStore.toggleFavorite()` çağır

- [ ] `components/recipes/MacroBar.tsx`
  - Tarif detayı için: Protein | Karbonhidrat | Yağ yatay bar
  - Animasyonlu dolum

- [ ] `components/recipes/IngredientRow.tsx`
  - Migros ürün görseli | malzeme adı | miktar | maliyet | kalori
  - Ürüne dokunma → Migros ürün detayı

- [ ] `components/recipes/MigrosProductCard.tsx`
  - Ürün görseli | adı | fiyat | birim fiyat (varsa)
  - "Seç" butonu

- [ ] `components/recipes/QuantityInput.tsx`
  - Miktar girişi + birim seçici dropdown
  - Canlı önizleme: "X [birim] ≈ Y gram"
  - Kalori önizleme: "≈ Z kcal"
  - Maliyet önizleme: "≈ ₺X.XX"

- [ ] `components/recipes/PriceHistory.tsx`
  - Genişletilebilir satır içi tablo
  - Tarih | fiyat | değişim (↑ kırmızı / ↓ yeşil animasyonu)

- [ ] `components/recipes/RecipeDetailHeader.tsx`
  - Tam genişlik görsel
  - Tarif adı + etiketler (kaynak, mutfak)
  - İstatistik satırı: toplam maliyet | toplam kalori | porsiyon

- [ ] `components/recipes/IngredientMatchList.tsx`
  - Migros arama sonuçları listesi
  - `useMigrosSearch` hook'u — 500ms debounce dahili

**✓ Checkpoint 5.1 geçti:** Tüm bileşenler mock data ile render ediliyor.

---

## Checkpoint 5.2 — Tarif Listesi ve Detay

- [ ] `app/(tabs)/recipes/index.tsx`
  - Boş durum: Avatar + "Henüz tarif yok" + 2 CTA butonu
  - Tarif kartları (dikey liste)
  - Başlık ikonları: 🥕 Malzemelerim | 🔍 Ara | ⊕ Yeni Tarif
  - Sola kaydır → sil (onay dialogu)

- [ ] `app/(tabs)/recipes/[id].tsx`
  - `RecipeDetailHeader`
  - Makro barı (animasyonlu)
  - Malzeme listesi — her biri `IngredientRow`
  - "Fiyatları Güncelle" butonu → Migros'tan güncel fiyatları çek, fiyat değişim animasyonu
  - `PriceHistory` genişletilebilir bölüm
  - Talimatlar (daraltılabilir)
  - Alt bar: "Günlüğe Ekle" (birincil) | "Düzenle" (ikincil)

**✓ Checkpoint 5.2 geçti:** Kaydedilmiş tarifleri görebiliyorsun, fiyat güncelleme animasyon yapıyor.

---

## Checkpoint 5.3 — Migros Eşleştirme Akışı

Tarife malzeme eklenirken en kritik akış.

- [ ] `app/(tabs)/recipes/ingredient-match.tsx`
  - Arama çubuğu (çevrilmiş malzeme adıyla önceden dolu)
  - Migros ürün listesi (`IngredientMatchList`)
  - "Manuel ara" butonu (otomatik arama başarısız olursa)
  - Ürün seçildikten sonra: `QuantityInput` aç
  - "Onayla" → yeni tarif ekranına geri dön

**✓ Checkpoint 5.3 geçti:** Bir malzeme için Migros araması → ürün seçimi → miktar girişi → tarifin malzeme listesine ekleme çalışıyor.

---

## Checkpoint 5.4 — Yeni Tarif Oluşturma

- [ ] `app/(tabs)/recipes/new.tsx`
  - Tarif adı girişi
  - Görsel seçici: Kamera | Galeri | Otomatik getir (DDGS/Unsplash)
  - TheMealDB arama bölümü → seç → malzemeleri otomatik doldur
  - VEYA "Sıfırdan oluştur" toggle
  - Porsiyon sayısı girişi
  - Malzeme listesi (başlangıçta boş)
  - "+ Malzeme Ekle" → `ingredient-match` akışına yönlendir
  - Her malzeme: görsel | ad | miktar | maliyet | kalori
  - Kaydet butonu (üst sağ, geçerli olana kadar disabled)

**✓ Checkpoint 5.4 geçti:** Sıfırdan tarif oluşturabiliyorsun ve tarif listesinde görünüyor.

---

## Checkpoint 5.5 — Malzemelerim

- [ ] `app/(tabs)/recipes/my-ingredients/index.tsx`
  - 2 sütunlu grid görünümü
  - Boş durum: Avatar + açıklama
  - Üst sağ: "+" butonu

- [ ] `app/(tabs)/recipes/my-ingredients/[id].tsx`
  - Hem "Yeni Malzeme" hem "Malzemeyi Düzenle"
  - Görsel seçici
  - Malzeme adı (Türkçe)
  - Migros fiyatı: "Migros'ta Ara" VEYA manuel giriş
  - Beslenme: OpenFoodFacts'ten otomatik getir VEYA manuel (100g başına)
  - Kaydet

**✓ Checkpoint 5.5 geçti:** Özel malzeme eklenebiliyor, hem Tarifler hem Profil tab'ından erişilebiliyor.

---

## Faz 5 Tamamlandı

**Kontrol et:**
- [ ] TheMealDB'den tarif arama + kaydetme çalışıyor
- [ ] Malzeme eşleştirme akışı: çeviri → Migros araması → ürün seçimi → miktar girişi
- [ ] Kalori + maliyet hesaplamaları doğru
- [ ] Fiyat güncelleme animasyonu çalışıyor (↑ kırmızı / ↓ yeşil)
- [ ] Favorilere ekleme çalışıyor

**Sonraki faz:** Faz 6 — Keşfet
