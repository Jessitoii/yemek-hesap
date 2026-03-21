---
trigger: model_decision
description: Yeni Özellik Geliştir
---

## Görev

Belirtilen özelliği KaloriTabak'a ekle. Mimari kurallara uygun, test edilebilir ve tutarlı bir şekilde.

## Adımlar

### 1. Analiz Et (önce oku, sonra yaz)

- `PROJECT.md` oku — özellik hangi katmanda? Bağımlılıklar tamamlandı mı?
- İlgili `docs/` dosyasını oku (özellik spec'i için `01-features.md`, ekran detayı için `03-screens.md`)
- Mevcut benzer bileşen/ekran var mı kontrol et — sıfırdan yazmadan önce yeniden kullan

### 2. Etkilenen Dosyaları Belirle

Şu katmanları kontrol et:
1. **Veritabanı değişikliği gerekiyor mu?** → yeni migration veya query
2. **Yeni servis/API çağrısı var mı?** → `services/` + cache stratejisi
3. **Store güncellenmeli mi?** → Zustand action ekle
4. **Yeni bileşen lazım mı?** → `components/` altında ilgili klasör
5. **Yeni ekran lazım mı?** → `app/(tabs)/` altında doğru path

### 3. Sırayla Uygula (alt → üst)

```
db/migrations/ (varsa)
       ↓
db/queries/
       ↓
services/ (varsa)
       ↓
utils/ (varsa)
       ↓
stores/
       ↓
components/
       ↓
app/ (ekran)
```

### 4. Kurallara Uygunluk Kontrolü

Her dosyayı yazmadan önce `rules.md`'den kontrol et:
- [ ] Raw SQL bileşende yok
- [ ] Hardcoded hex renk yok → `colors.ts` token'ı kullan
- [ ] `any` tipi yok → `types/` altında tanımla
- [ ] API key `.env`'den geliyor
- [ ] Migros araması debounce'lu + cache'li
- [ ] Çeviriler MyMemory'den önce cache'e bakıyor

### 5. Edge Case'leri Uygula

`docs/01-features.md`'nin sonundaki **Edge Cases** tablosuna bak.
Özellikle:
- API down → fallback
- Boş state → EmptyState bileşeni + avatar
- Profile eksik → yönlendirme

### 6. PROJECT.md Güncelle

Tamamlanan dosyaları `PROJECT.md`'de işaretle.
