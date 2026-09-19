# PROMPT & IMPLEMENTATION SPECIFICATION: VERSIYON 4.0
## MODÜL: STEALTH GÜVENLİK, KAMUSAL GİZLEME & YÜZ MASKELEME

---

### 🎯 Amaç & Kapsam
Hollanda ve Avrupa'daki VIP üyelerin, kamuya açık alanlarda (metro, kafe, iş yeri) ekrana bakarken veya platforma fotoğraf yüklerken kimliklerini ve mahremiyetlerini %100 güvenceye almalarını sağlar.

---

### 📋 Fonksiyonel Gereksinimler & Komponentler

1. **Decoy Stealth Screen (Kamusal Kamuflaj Kalkanı)**:
   - Üst bardaki kalkan butonu veya `Esc` / `Ctrl+Shift+D` kısayolu ile anında tetikleme.
   - Platform arayüzünü saniyeler içinde *"The Architectural Chronical & Fine Arts Review"* gazetesine çevirme.
   - Kamuflaj modundan çıkış için gizli PIN veya şifreli çıkış butonu.

2. **Discreet Face Masking (Yüz Maskeleme)**:
   - Gönderi paylaşırken opsiyonel *"Otomatik Yüz Maskeleme"* seçeneği.
   - Görsel üzerine siyah cemiyet bandı ve buzlu cam (Discreet Mask) efekti yerleştirme.

3. **1x Ephemeral View-Once Medya**:
   - Sohbette sadece tek seferlik açılabilen özel fotoğraflar.
   - 5 saniyelik geri sayım sonrası görselin kalıcı olarak karartılıp imha edilmesi.

4. **Intimate / Sensitive Content Scrim**:
   - Mahrem ve hassas içeriklerin varsayılan olarak buzlu (blur) görünmesi, kullanıcının üzerine tıklayarak açması.

---

### 🧪 Doğrulama & Kabul Kriterleri (Acceptance Criteria)
- [ ] Kalkan butonuna basıldığında gazete kamuflajı anında devreye giriyor mu?
- [ ] Yüz maskeleme seçilen gönderilerde cemiyet bandı doğru konumlanıyor mu?
- [ ] 1x Ephemeral mesajlar 5 saniye sonra yok ediliyor mu?
