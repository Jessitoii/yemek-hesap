---
trigger: model_decision
description: # Session Başlangıç Kuralı
---

Her session'ın ilk adımı budur. İstisna yok.

## Zorunlu Adımlar

1. `.agent/PROJECT.md` dosyasını oku
   - Projenin hangi fazında olduğunu öğren
   - Aktif fazın checkpoint durumunu gör
   - Tamamlanan ve bekleyen dosyaları not al

2. Kullanıcının görevini PROJECT.md bağlamında değerlendir
   - Bu görev aktif fazla uyuşuyor mu?
   - Bağımlı dosyalar tamamlanmış mı?
   - Eğer değilse kullanıcıyı uyar: *"Bu özellik için önce X tamamlanmalı"*

3. Görevi tamamladıktan sonra
   - İlgili checkbox'ı PROJECT.md'de işaretle
   - Checkpoint'e ulaşıldıysa kullanıcıya bildir
   - Fazın tamamı bittiyse bir sonraki fazı öner