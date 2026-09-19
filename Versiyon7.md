# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 7.0
## MODÜL: RENDEZVOUS PASSPORT (SEYAHAT & ŞEHİR ROTASI)

---

### 🎯 Amaç & Kapsam
Avrupa içi (Amsterdam, Berlin, Paris, Londra vb.) seyahat eden üyelerin, gidecekleri şehirlerdeki özel salon ve partileri önceden planlayarak yerel üyelerle erkenden eşleşmesini sağlar.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Seyahat Pasaportu Düzenleyici (Travel Planner)**:
   - Hedef Şehir ve Ülke seçimi (örn: *Amsterdam, Hollanda*).
   - Başlangıç ve Bitiş tarihleri seçimi (örn: *24-29 Ekim*).
   - Seyahat amacı ve ilgi alanları (örn: *Villa Swinger Party & Noord Salonları*).

2. **Profilde Rota Damgası (Passport Stamp)**:
   - Kullanıcı profilinde şık bir yeşil *"Planlandı / Scheduled"* rozeti.
   - Diğer üyelerin profili gezerken seyahat tarihlerini görebilmesi.

3. **Gelecek Şehir Filtresi (Discovery Integration)**:
   - Keşfet sayfasında belirli bir tarihte o şehirde bulunacak üyeleri filtreleme.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Profil üzerinden seyahat şehri, tarihleri ve amacı düzenlenip kaydedilebiliyor mu?
- [ ] Kaydedilen rota profil kartında düzgün şekilde sergileniyor mu?
