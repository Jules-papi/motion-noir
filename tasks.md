# MAISON NOIR — EKSİKLER & GELİŞTİRME YOL HARİTASI

> **Çalışma Prensibi:** Bu dosyadaki maddeler sırayla ele alınacaktır. Bir görev tamamen bitirilip doğrulanmadan diğerine geçilmeyecektir. Tamamlanan maddeler `[x]` olarak işaretlenecektir.

---

## FAZ 1: Tasarım Bütünlüğü & Görsel Düzeltmeler (Visual Consistency & Anti-Slop)

- [x] **1.0. Feed & Genel Zemin Optimizasyonu**
  - OLED siyah zemin (`#07080A`), taşma/kayma (`overflow-x`) engellemesi.
  - Mobil alt menünün (dock) stabil, modern ve taşmayan hale getirilmesi.
  - Gönderi kartları ve hikaye çubuğunun (`StoriesBar`) yuvarlatılmış lüks estetiğe kavuşturulması.

- [x] **1.1. Sağ Kenar Çubuğu (`RightBar.tsx`) Revizyonu**
  - Eski soluk siyah (`#09090b`), keskin köşeler (`rounded-xs`) ve çiğ sarı kenarlıklar kaldırıldı.
  - Feed ve sol menüyle tam uyumlu OLED zemin (`#121419` / `#181B22`), `rounded-2xl` kartlar, şampanya/beyaz renk hiyerarşisi uygulandı.
  - Yuvarlatılmış avatarlar ve yüksek kontrastlı modern butonlar yerleştirildi.

- [x] **1.2. Kulüpler & Topluluklar (`ClubsView.tsx`) Revizyonu**
  - Ucuz SaaS şablonu hissi veren mor/pembe neon gradyan banner tamamen kaldırıldı.
  - Monokrom, Paris/Amsterdam gizli cemiyet estetiğine uygun lüks kart ve filtre yapısı (`Cercles & Chapitres`) inşa edildi.
  - Şampanya tonları (`#E5C590`), pill kapsül kategoriler ve şık doluluk çubukları yerleştirildi.

- [x] **1.3. Forum & Münazara (`ForumView.tsx` & `ForumTopicDetail.tsx`) Revizyonu**
  - Mor degradeli yapay zeka klişesi banner tamamen kaldırıldı.
  - Akıcı, editoryal münazara listesi (`Chamber Debates & Nocturne Chronicles`) ve modern salon detay arayüzü kuruldu.
  - Kategori filtreleri, arama çubuğu ve yanıt formları modern OLED standartlarına eşitlendi.

- [x] **1.4. Keşif & Vitrin (`DiscoveryView.tsx` & `DiscoveryProfileCard.tsx`) Revizyonu**
  - Eski alt çizgili sekmeler modern kapsül (pill) segment kontrollere (`All Dossiers`, `Couples`, `Singles`, `Privé Circle`) dönüştürüldü.
  - Şehir ve arama filtre paneli `rounded-2xl` ve `rounded-full` form girdileriyle OLED paletine uyarlandı.
  - Profil kartları `rounded-2xl`, dikey portre kompozisyonu, `#E5C590` şampanya rozetleri ve tam uyumlu yuvarlak butonlarla donatıldı.

- [x] **1.5. Profil & Dossier (`Profile.tsx` & `ProfileHeader.tsx`) Görsel Eşitlemesi**
  - Profil başlığı, biyografi, istatistik hapları, partner kartı (`RelationshipPartnerCard`) ve galeri kartları (`ProfilePostGridItem`) `rounded-2xl` ve `rounded-full` Quiet Luxury geometriye eşitlendi.
  - Eski alt çizgili sekmeler yerine `rounded-full` pill capsule segment kontroller entegre edildi.
  - `#E5C590` şampanya altın rozetleri, kilitli/mühürlü albüm ikonları ve aksiyon butonları standardize edildi.

---

## FAZ 2: Dil & Terminoloji Birliği (Editorial Tone & Localization)

- [x] **2.1. Dil ve Terminoloji Bütünlüğü**
  - İngilizce ve Türkçe terminoloji lüks "Maison Noir" standartlarına yükseltildi (`The Chronicle`, `The Registry`, `Cercles & Chapitres`, `Confidential Ephemeral Plate`, `Encrypted Dispatches`, `Sealed Private Chamber`).
  - Sohbet, Keşif, Etkinlik ve Profil bileşenlerindeki argo/klişe metinler arındırıldı.
  - i18n sözlüğü (`i18n.ts`) Quiet Luxury standartlarına tam uyarlandı.

---

## FAZ 3: Fonksiyonel Mantık & Gerçek İş Akışları (Functional Completeness)

- [x] **3.1. Kalıcı Hafıza (LocalStorage State Persistence)**
  - Sayfa yenilendiğinde (F5) cüzdan bakiyesinin, beğenilerin, kilit açma durumlarının ve kayıtların sıfırlanmasının önlenmesi (`src/utils/storage.ts` ve `useSocialPlatform.ts` entegrasyonu).
  - Cüzdan, gönderiler, kulüpler, etkinlikler, forum başlıkları ve sohbetler tek merkezden yerel depolama ile senkronize edildi.

- [x] **3.2. PPV & Kasa (Vault) Kilit Açma Mantığı**
  - Kilitli gönderilerin bakiyeden gerçek düşüş yaparak açılması ve kilidinin kalıcı olarak saklanması.
  - Bakiyesi yetersiz olan kullanıcıya bakiye yükleme yönlendirmesi.

- [x] **3.3. Eşleşme (Match) & Doğrudan Sohbet Başlatma**
  - Keşif kartında ve eşleşme modalında "Sohbet Başlat" butonunun gerçek bir mesajlaşma odası oluşturup Chat sekmesine aktarması (`handleStartConversationWithProfile`).

- [x] **3.4. Sohbet & Medya İmha Mekanizması (View Once & Voice Notes)**
  - "1 Kez Görüntülenebilir" medyanın 5 saniyelik geri sayım sonrası tamamen imha edilmesi (`isViewedOnce = true`).
  - Dinlenebilir Web Audio sentezleyicisi ve frekans dalgası animasyonlu sesli not deneyimi.

- [x] **3.5. Kulüp & Forum Canlı Etkileşimi**
  - Katılınan kulüplerin ve açılan forum başlıklarının/yanıtlarının hafızada saklanarak tartışmanın devam ettirilebilmesi.

- [x] **3.6. Etkinlik & NDA Bilet Döngüsü**
  - Özel etkinliklerde başvuru ➔ küratör onayı ➔ dijital NDA rıza sözleşmesi imzası ➔ kişiye özel şifreli QR bilet üretimi döngüsünün tam entegrasyonu.

---

## FAZ 4: İleri Düzey İstemci Tarafı & İnteraktif Özellikler (Advanced Client-Side Features)

- [x] **4.1. Gerçek Mikrofon Ses Kaydı (Live Audio Note Recording)**
  - `navigator.mediaDevices.getUserMedia` ve `MediaRecorder` API ile sohbette gerçek mikrofon kaydı yapma.
  - Kaydedilen ses dalgasının önizlenmesi, silinmesi veya sohbete gönderilip anında çalınabilmesi.

- [x] **4.2. Cihazdan Medya/Fotoğraf Yükleme & Özel Gönderi/Hikaye Paylaşımı**
  - Bilgisayar veya telefondan fotoğraf/video seçerek özel PPV kilit fiyatı veya standart içerik yayınlama.
  - Hikayeler (Stories) bölümüne kendi fotoğrafını ekleyebilme ve 24 saatlik süre sayacı.

- [x] **4.3. Maison Noir Özel "Concierge" Sohbet Asistanı**
  - Sohbette sabit olarak bulunan "Maison Noir Concierge" odası.
  - Üyenin tarzına, şehrine ve ilgi alanlarına göre etkinlik/kulüp ve salon tavsiyeleri veren akıllı etkileşimli küratör.

- [x] **4.4. Dijital Bilet Cüzdanı & QR Bilet Okutma/Doğrulama Simülasyonu**
  - Kullanıcının sahip olduğu tüm onaylı etkinlik biletlerinin listelendiği şık Bilet Kartlığı / Cüzdanı.
  - Etkinlik kapısında organizatör/görevli modunda bilet QR kodunu tarama veya doğrulama (`Check-in`).

- [x] **4.5. Detaylı Cüzdan, Harcama Analizi & Bahşiş/Transfer Akışı**
  - Bakiye yükleme (Coin top-up), gönderilere doğrudan bahşiş bırakma (Tip), içerik üretici gelirleri ve harcama dökümü grafikleri.

- [x] **4.6. Gelişmiş Arama & Filtreleme Matrisi**
  - Keşif ve etkinliklerde mesafe, yaş aralığı, onaylı çift/bireysel filtreleri ve anlık sonuç güncellemesi.
