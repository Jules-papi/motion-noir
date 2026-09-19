# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 10.0
## MODÜL: FİNANSAL MONETİZASYON, VIP ÜYELİK & AI CONCIERGE

---

### 🎯 Amaç & Kapsam
Platform sahibinin ve içerik üreticilerinin gelir elde etmesini sağlayan finansal kasa, VIP abonelik katmanı, kilitli medya satışı (PPV), bahşiş sistemi ve 7/24 AI Concierge asistanını entegre eder.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Privé Patron VIP Abonelik Katmanı**:
   - Aylık / Yıllık abonelik satın alma paketi.
   - Profilde ve yorumlarda parlayan *"VIP Member"* rozeti.
   - VIP üyelere tüm kulüp etkinliklerine ücretsiz giriş ve kilitli patron içeriklerine sınırsız erişim.

2. **PPV (Pay-Per-View) Kilitli Gönderi Satışı**:
   - Gönderi paylaşırken kilit açma ücreti (örn: *50 ₺ / 25 €*) belirleme.
   - Kilitli fotoğrafı açmak isteyen üyelerin cüzdan bakiyesinden tahsilat yapılması.

3. **İçerik Üretici Bahşiş Sistemi (Tipping)**:
   - Gönderilerin veya profillerin altındaki *"Tip"* butonu ile doğrudan bakiye transferi.

4. **Finansal Cüzdan & IBAN Çekim Masası (Payout Engine)**:
   - Toplam bakiye, kazanılan tutar ve işlem geçmişi tablosu.
   - Hollanda / Avrupa IBAN banka transfer çekim talep formu.

5. **7/24 AI Concierge Masası**:
   - Yapay zeka destekli cemiyet asistanı: Etkinlik tavsiyeleri, stil önerileri, NDA kuralları ve salon eşleşme rehberi.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] VIP üyelik satın alındığında ayrıcalıklar anında açılıyor mu?
- [ ] PPV gönderi kilit açma ücreti bakiyeden düşülüp fotoğraf görünür oluyor mu?
- [ ] Bahşiş gönderimi ve IBAN para çekme talebi başarıyla işleniyor mu?
- [ ] AI Concierge sohbet ekranında akıllı yanıtlar veriyor mu?
