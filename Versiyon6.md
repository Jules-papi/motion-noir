# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 6.0
## MODÜL: DATE GUARDIAN (RANDEVU GÜVENLİK & CHECK-IN MOTORU)

---

### 🎯 Amaç & Kapsam
Fiziksel randevulara giden kullanıcıların can ve mahremiyet güvenliğini korumak için tasarlanmış gerçek zamanlı bir emniyet ve acil durum protokolüdür.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Canlı Buluşma Geri Sayımı (Date Timer)**:
   - Kullanıcının buluşma süresini belirlemesi (30 dk, 60 dk, 120 dk vb.).
   - Buluşma başladıktan sonra arayüzde çalışan geri sayım çubuğu.

2. **Güvenlik Check-in ve PIN Doğrulaması**:
   - Süre dolduğunda kullanıcının güvenle ayrıldığını onaylaması için 4 haneli PIN girme ekranı.
   - Doğru PIN girilmeden oturumun kapanmaması.

3. **Acil Durum Kontak & Alarm Protokolü**:
   - Check-in süresi aşıldığında veya acil durum tetiklendiğinde önceden tanımlı acil durum irtibatına otomatik bildirim simülasyonu.
   - Yerel depolama (LocalStorage) ile tarayıcı kapansa dahi sayacın kaybolmaması.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Randevu süresi başlatıldığında geri sayım aktifleşiyor mu?
- [ ] 4 haneli PIN kodu ile randevu güvenle sonlandırılabiliyor mu?
- [ ] Süre dolduğunda alarm ve acil durum bildirimi üretiliyor mu?
