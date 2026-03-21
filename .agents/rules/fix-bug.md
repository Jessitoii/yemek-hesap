---
trigger: manual
description: Hata Düzelt
---

## Görev

Belirtilen hatayı bul ve düzelt. Düzeltme yaparken başka şeyleri bozma.

## Adımlar

### 1. Hatayı Anla

- Hata hangi ekranda / bileşende ortaya çıkıyor?
- Hangi kullanıcı aksiyonu tetikliyor?
- Beklenen davranış nedir? Gerçekleşen ne?

### 2. Katmanı Belirle

Hata hangi katmanda?

| Semptom | Muhtemelen |
|---|---|
| Ekran render edilmiyor / crash | `app/` ekran dosyası |
| Veri yanlış gösteriliyor | `stores/` veya `db/queries/` |
| API cevabı gelmiyor | `services/` |
| Cache çalışmıyor | `db/queries/cache.ts` |
| Hesaplama yanlış | `utils/` |
| Tip hatası | `types/` |

### 3. İlgili Dosyaları Oku

Değiştirmeden önce her dosyayı baştan sona oku.

### 4. Düzelt

Minimal değişiklik yap — sadece hatayı düzelt, başka şeylere dokunma.

### 5. Yan Etkileri Kontrol Et

- Aynı fonksiyonu başka yerler de kullanıyor mu?
- Cache'i temizlemek gerekiyor mu?
- Store güncellenmesi gerekiyor mu?

### 6. Edge Case'leri Kontrol Et

`docs/01-features.md` sonundaki Edge Cases tablosuna bak — bu hata orada var mıydı?

### 7. Sonucu Raporla

Ne değişti, neden, başka neyi etkileyebilir?