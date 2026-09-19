# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 1.0
## MODÜL: ÇEKİRDEK MVP & TEMEL CEMİYET KATMANI

---

### 🎯 Amaç & Kapsam
Bu sürüm, müşteriye teslim edilecek ilk çalışan temel sürümdür (MVP). Kullanıcıların sisteme giriş yapması, temel profillerini düzenlemesi, diğer üyeleri listelemesi ve basit metin tabanlı iletişim kurmasını sağlar.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Kullanıcı Profili (Dossier View)**:
   - Profil avatarı, isim, kullanıcı adı (`@username`), bio ve şehir/konum bilgisi.
   - Yaş, cinsiyet ve temel cinsel yönelim (hetero, biseksüel vb.) seçimi.
   - Profil düzenleme formu ve yerel kaydetme.

2. **Keşfet & Üye Listesi (Discovery Module)**:
   - Üyelerin grid ve liste formatında görüntülenmesi.
   - Yaşa, konuma ve cinsiyete göre temel filtreleme çubuğu.
   - Üye kartına tıklandığında profil detaylarının açılması.

3. **Genel Akış (Dispatch Feed)**:
   - Standart fotoğraf ve metin gönderisi (Post) paylaşma arayüzü.
   - Gönderileri beğenme (Like), kaydetme (Bookmark) ve yorum yazma (Comment).

4. **Birebir Mesajlaşma (Direct Messaging)**:
   - Kullanıcılar arası birebir anlık metin sohbeti.
   - Sohbet geçmişi listesi ve okunmamış mesaj rozeti.

5. **Arayüz Teması & Tasarım**:
   - Yüksek kontrastlı, sessiz lüks (Quiet Luxury) koyu tema (`#07080A` ve altın `#E5C590` aksanları).
   - Tamamen responsive (Mobil ve Masaüstü uyumlu).

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Üye profili oluşturulup kaydedilebiliyor mu?
- [ ] Keşfet sayfasında üyeler listelenip filtrelenebiliyor mu?
- [ ] Yeni gönderi paylaşılıp beğeni/yorum yapılabiliyor mu?
- [ ] İki kullanıcı arasında metin mesajı iletiliyor mu?
