# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 3.0
## MODÜL: SESLİ NOTLAR & ZENGİN MULTİMEDYA SOHBET

---

### 🎯 Amaç & Kapsam
Telegram ve WhatsApp seviyesinde interaktif, uçtan uca şifrelenmiş sesli mesajlar, yüksek çözünürlüklü medya paylaşımı ve çağrı simülasyonu altyapısını sisteme entegre eder.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **İnteraktif Sesli Mesaj Motoru (Voice Notes)**:
   - Gerçek zamanlı mikrofon kaydı (MediaRecorder API) veya simülasyonu.
   - Dinamik ses dalgası (Audio Waveform) görselleştirmesi.
   - Oynat/Durdur kontrolleri, süre sayacı ve çalma ilerleme çubuğu.

2. **Zengin Multimedya Gönderimi**:
   - Sohbette fotoğraf ve belge ekleme (Paperclip/Media attachment).
   - Yüklenen medyaların tam ekran inceleme penceresinde açılması.

3. **Sohbet Durum Göstergeleri (Typing & Delivery Status)**:
   - *"Yazıyor..."* animasyonlu göstergesi.
   - Tek tik (İletildi), Çift tik (Görüldü/Seen) durum ikonları.

4. **Şifreli Sesli/Görüntülü Arama Arayüzü**:
   - Üst barda Encrypted Audio/Video Call butonları.
   - Güvenli bağlantı durum bildirimleri.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Mikrofon butonuna basılı tutarak/tıklayarak sesli mesaj kaydedilip gönderilebiliyor mu?
- [ ] Ses dalgası animasyonu tıklanarak ses durdurulup devam ettirilebiliyor mu?
- [ ] Fotoğraf ekleyip sohbet penceresinde net şekilde görüntülenebiliyor mu?
