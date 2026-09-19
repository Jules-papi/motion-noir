# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 9.0
## MODÜL: ETKİNLİK KÜRASYONU, ONAY MASASI & QR BİLET CÜZDANI

---

### 🎯 Amaç & Kapsam
Özel villa partileri, maskeli balolar, kulüp geceleri ve etkinlik organizatörlerinin bilet satış ve kapı giriş operasyonunu yönetmesini sağlar.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Etkinlik Listeleme & Detayları**:
   - Tarih, mekan (Gizli / Başvuru sonrası açılır), kıyafet kodu (Dress code), kontenjan ve bilet fiyatı.
   - VIP üyelere ücretsiz katılım desteği (`vipFree: true`).

2. **Küratör Başvuru & Onay Masası**:
   - Katılmak isteyen üyelerin katılım tipi (Çift / Tek) ve başvuru notu göndermesi.
   - Organizatörün başvuruyu inceleyip tek tıkla Onaylama / Reddetme yetkisi.

3. **Dijital Rıza & NDA Sözleşmesi**:
   - Hollanda yetişkin etkinlikleri mevzuatına uygun zorunlu gizlilik ve rıza taahhütnamesi imzalama adımı.

4. **Kişisel QR Bilet Cüzdanı**:
   - Onaylanan veya satın alınan biletler için dinamik şifreli QR kod üretimi.
   - Kapıda taranabilir *"VIP-AMS-XXXX"* formatında bilet cüzdanı arayüzü.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Etkinliğe başvuru yapılıp organizatör onayından geçiyor mu?
- [ ] Onaylanan etkinlik için dijital NDA imzalanıp QR kod üretiliyor mu?
- [ ] Üretilen QR kod bilet cüzdanında doğru şekilde sergileniyor mu?
