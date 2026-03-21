---
trigger: manual
description: Kodu İncele
---

## Görev

Yazılan kodu mimari kurallara, tip güvenliğine ve proje standartlarına göre incele.

## Kontrol Listesi

### Mimari
- [ ] Component raw SQL içeriyor mu? → `db/queries/` katmanına taşı
- [ ] Component doğrudan servis çağırıyor mu? → Store üzerinden git
- [ ] Store'lar arası import var mı? → Yasak, yeniden düzenle
- [ ] `services/` içinde React import var mı? → Pure fonksiyon olmalı

### Tip Güvenliği
- [ ] `any` tipi var mı? → `types/` altında tanımla
- [ ] Opsiyonel zincir (`?.`) null case'i handle ediyor mu?
- [ ] API response tipleri `types/api.ts`'den mi geliyor?

### UI Standartları
- [ ] Hardcoded hex renk var mı? → `colors.ts` token'ı kullan
- [ ] Hardcoded pixel değeri var mı? → `spacing/radius/shadow` token'ı kullan
- [ ] `StyleSheet.create` yerine inline style mi? → Basit durumlar için kabul edilebilir
- [ ] `phosphor-react-native` dışında ikon var mı? → Değiştir
- [ ] `Animated` API kullanılmış mı? → `react-native-reanimated`'e geç

### Performans
- [ ] Migros araması debounce'suz mu? → 500ms ekle
- [ ] API çağrısından önce cache kontrolü var mı?
- [ ] `useEffect` dependency array eksik mi?
- [ ] Büyük liste `FlatList`/`FlashList` kullanıyor mu?

### Güvenlik
- [ ] API key hardcoded mi? → `.env`'e taşı
- [ ] SQL injection riski var mı? → Parameterized query kullan

### Edge Case'ler
- [ ] API down durumu handle ediliyor mu?
- [ ] Boş liste durumu var mı? → `<EmptyState>` kullan
- [ ] Loading durumu gösteriliyor mu?
- [ ] Hata durumu kullanıcıya bildiriliyor mu?

## Çıktı Formatı

Her sorun için:
1. Dosya + satır numarası
2. Ne yanlış
3. Nasıl düzeltilmeli (kod örneği ile)