---
activation: model_decision
trigger_when: "API çağrısı yazarken, Migros/TheMealDB/OpenFoodFacts/USDA/MyMemory/Cerebras kullanırken, cache stratejisi uygularken, fiyat hesaplarken"
---

# API Çağrısı Kuralları

## Genel Prensipler

- Tüm API anahtarları `.env`'den: `process.env.EXPO_PUBLIC_*`
- Her API çağrısı `try/catch` içinde — servis fonksiyonları asla throw etmez, boş array veya null döner
- `services/` katmanı pure async — React, state, side effect yok

## Cache Önceliği — Her Zaman Önce Cache Kontrol Et

```
Migros araması:
  migros_cache (SQLite, 24 saat) → bulunamadı → API → cache'e yaz

Çeviri (İngilizce → Türkçe):
  translations (SQLite, süresiz) → bulunamadı → MyMemory API → cache'e yaz

Kalori/makro verisi:
  calorie_cache (SQLite, süresiz) → bulunamadı → OpenFoodFacts → bulunamadı → USDA → cache'e yaz
```

## Migros Özel Kuralları

- Arama girişlerini **500ms debounce** et — her tuş basışında API çağırma
- `shownPrice` kuruş cinsinden: `4625 → 46.25 TL` (100'e böl)
- Endpoint değişebilir (gayri-resmi) — her zaman try/catch, hata durumunda "Fiyat alınamadı, manuel girin"

```typescript
// Maliyet hesaplama
const costTL = (priceKurus / 100 / productGrams) * usedGrams
```

## MyMemory Limiti

- Günlük 1000 istek — cache olmadan kolayca aşılır
- Cache'de yoksa → API çağır → cache'e yaz
- API limiti aşıldıysa → İngilizce adı `(EN)` etiketiyle göster, uygulamayı durdurma

## Besin Değeri Fallback Zinciri

```
1. calorie_cache (SQLite) → var → hemen döndür
2. OpenFoodFacts API      → var → cache'e yaz + döndür
3. USDA API              → var → cache'e yaz + döndür
4. null döndür           → kullanıcıdan manuel giriş iste → cache'e yaz
```

## Cerebras API — Yalnızca Öğün Planı İçin

- Tek günlük akıllı tarif önerisi: **rule engine** — Cerebras çağırma
- Yalnızca çok günlük öğün planı oluşturma: Cerebras
- Kural motoru yeterliyse (≥10 tarif varsa) Cerebras çağırma

## Hata Durumu Mesajları (Türkçe)

| Durum | Kullanıcıya göster |
|---|---|
| Migros erişilemiyor | "Fiyat alınamadı — manuel girin" |
| Çeviri başarısız | İngilizce adı göster, `(EN)` etiketi ekle |
| Besin değeri bulunamadı | "Kalori bilgisi giriniz" |
| TheMealDB sonuç yok | "Tarifi manuel oluştur" akışına yönlendir |
| Görsel bulunamadı | Varsayılan placeholder göster |
