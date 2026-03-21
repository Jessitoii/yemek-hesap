---
trigger: model_decision
description: # Mimari Kurallar
---

## Katman Hiyerarşisi ve Veri Akışı

```
Ekranlar (app/)
    ↕  yalnızca hook ve store kullanır
Zustand Stores (stores/)
    ↕  yalnızca db/queries/ çağırır
DB Query Layer (db/queries/)
    ↕  yalnızca expo-sqlite kullanır
SQLite (expo-sqlite)
```

```
Ekranlar (app/)
    ↕  hook üzerinden
Custom Hooks (hooks/)
    ↕  pure async çağrı
Services (services/)
    ↕  HTTP fetch
Dış API'ler
```

## İhlal Edilemez Kurallar

| Yasak | Doğrusu |
|---|---|
| Component içinde `db.runAsync(...)` | `db/queries/` fonksiyonu yaz, store'dan çağır |
| Store içinde `fetch(...)` | `services/` fonksiyonu yaz, hook'tan çağır |
| Service içinde `useState` | Service pure async fonksiyon olmalı |
| `utils/` içinde `fetch` veya DB çağrısı | Utils sadece saf hesaplama yapar |
| Store'lar arası import | Her store bağımsız, veri ekranda birleşir |
| `app/` içinde SQL | Asla |

## Bağımlılık Yönü

Bağımlılık yalnızca aşağı akar:
```
app → stores → db/queries → expo-sqlite
app → hooks → services → fetch
```

Yukarı bağımlılık yasak: `services/` hiçbir zaman `stores/`'u import etmez.