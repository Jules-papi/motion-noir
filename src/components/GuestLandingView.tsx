import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Calendar, 
  Users, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  KeyRound,
  Eye,
  Flame,
  Globe2,
  ChevronDown
} from 'lucide-react';
import { ActiveViewType } from './Sidebar';

interface GuestLandingViewProps {
  onNavigate: (view: ActiveViewType) => void;
  onOpenAuth: () => void;
  totalMembersCount?: number;
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({
  onNavigate,
  onOpenAuth,
  totalMembersCount = 14200,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Üye olmadan veya giriş yapmadan platformu gezebilir miyim?',
      a: 'Evet, kesinlikle! JOYclub modelinde olduğu gibi Major Club üzerindeki tüm onaylı üye profillerini, topluluk akışını ve etkinlik listelerini giriş yapmadan serbestçe inceleyebilirsiniz. Yalnızca doğrudan mesaj gönderme, fotoğraf yükleme veya özel mahzen kilitlerini açma gibi eylemlerde üyelik gereklidir.'
    },
    {
      q: 'Gerçek adım veya telefon numaram görünür mü?',
      a: 'Asla. Major Club tamamen takma ad (moniker) ve uçtan uca gizlilik prensibiyle çalışır. Profilinizde yalnızca paylaşmak istediğiniz bilgiler yer alır. Ayrıca fotoğraflarınızı genel akışa veya yalnızca izin verdiğiniz kişilere açık Özel Mahzen (Private Vault) altında saklayabilirsiniz.'
    },
    {
      q: 'Kadınlar ve çiftler için güvenlik ve rıza nasıl garanti ediliyor?',
      a: 'Topluluğumuzda sıfır toleranslı katı bir rıza ve saygı manifestosu uygulanır. Israrcı davranışlar, izinsiz medya paylaşımı veya nezaketsizlik anında kalıcı hesap ihracıyla sonuçlanır. Her üyenin sınırları (Hard Limits) profilinde açıkça listelenir.'
    },
    {
      q: 'Özel partilere ve salon davetlerine nasıl katılabilirim?',
      a: 'Etkinlikler sekmesindeki partileri serbestçe inceleyebilirsiniz. Katılmak istediğinizde kimlik doğrulaması tamamlanmış profilinizle tek tıkla davet talebi gönderebilirsiniz. Etkinlik ev sahipleri başvurunuzu inceleyip gizli lokasyonu iletir.'
    },
    {
      q: 'Private / Özel Mahzen içerikleri nedir?',
      a: 'Üyelerin daha samimi veya sanatsal fotoğrafları şifreli mahzenlerde korunur. Giriş yapmamış ziyaretçiler bu mahzenlerin yalnızca sansürlü önizlemesini görebilir; içeriklerin açılması için iki tarafın karşılıklı rızası veya VIP izin gerekir.'
    },
  ];

  return (
    <div className="w-full space-y-20 pb-20 text-[#e4e2de] font-sans">
      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#121419] to-[#07080A] border border-white/[0.08] p-6 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E5C590]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Logo in Hero */}
          <div className="flex justify-center mb-2">
            <img 
              src="/major-club-logo.png" 
              alt="MAJOR CLUB" 
              className="h-16 sm:h-24 w-auto object-contain drop-shadow-[0_10px_25px_rgba(229,197,144,0.3)] hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#E5C590]/30 text-xs font-mono text-[#E5C590] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Société Privée · Paris & Amsterdam</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            Özgür, Güvenli ve Seçkin <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#E5C590] via-white to-[#E5C590] bg-clip-text text-transparent italic">
              Yetişkin Komünitesi
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
            Sıradan swipe uygulamalarının ötesinde: Doğrulanmış açık çiftler, bağımsız kadınlar ve seçkin üyeler için tasarlanmış; partilerin, zengin profillerin ve karşılıklı rızanın buluştuğu dijital salon.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigate('discovery')}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Üyeleri & Dizini Keşfet</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#181B22] hover:bg-[#222631] text-[#E5C590] border border-[#E5C590]/40 font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ücretsiz Katıl / Giriş Yap</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 font-mono pt-2">
            ✓ Üye olmadan tüm genel profilleri ve etkinlikleri inceleyebilirsiniz.
          </p>
        </div>
      </section>

      {/* ========================================================
          2. İNFOGRAFİ & GÜVENİLİRLİK METRİKLERİ
          ======================================================== */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C590]">
            Telemetri & Güven Standardı
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Sayılarla Major Club
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] text-center space-y-2 shadow-xl hover:border-white/20 transition-all">
            <Users className="w-6 h-6 text-[#E5C590] mx-auto" />
            <div className="font-serif text-3xl sm:text-4xl text-white font-normal">
              14,200+
            </div>
            <div className="text-xs font-medium text-zinc-300">Doğrulanmış Üye</div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Açık çiftler, bağımsız kadınlar ve centilmen patronlar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] text-center space-y-2 shadow-xl hover:border-white/20 transition-all">
            <Lock className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="font-serif text-3xl sm:text-4xl text-white font-normal">
              %100
            </div>
            <div className="text-xs font-medium text-zinc-300">Uçtan Uca Gizlilik</div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Şifreli fotoğraf mahzenleri ve takma ad güvencesi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] text-center space-y-2 shadow-xl hover:border-white/20 transition-all">
            <Calendar className="w-6 h-6 text-[#E5C590] mx-auto" />
            <div className="font-serif text-3xl sm:text-4xl text-white font-normal">
              380+
            </div>
            <div className="text-xs font-medium text-zinc-300">Özel Parti & Buluşma</div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Paris, Amsterdam ve Londra'da düzenlenen seçkin geceler.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] text-center space-y-2 shadow-xl hover:border-white/20 transition-all">
            <ShieldCheck className="w-6 h-6 text-sky-400 mx-auto" />
            <div className="font-serif text-3xl sm:text-4xl text-white font-normal">
              48 Saat
            </div>
            <div className="text-xs font-medium text-zinc-300">Manuel Onay Standardı</div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Bot ve sahte profillerden arındırılmış gerçek komünite.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. İÇERİK KATEGORİLERİ (4 BÜYÜK GRID KARTI - HERKESE AÇIK)
          ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C590] block">
              Açık Erişim Dünyaları
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-light">
              Neyi Keşfetmek İstersiniz?
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Tıklayarak üye olmadan doğrudan içeriği inceleyebilirsiniz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Üye Kataloğu (The Registry) */}
          <div 
            onClick={() => onNavigate('discovery')}
            className="group p-6 rounded-2xl bg-[#121419] border border-white/[0.08] hover:border-[#E5C590]/50 transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#E5C590] group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#E5C590] transition-colors">
                Üye Kataloğu & Eşleşmeler (The Registry)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kadınlar, açık çiftler ve beyefendilerin kompakt JOYclub tarzı katalog dizini. Yaş, şehir, yönelim ve fantezi tercihlerine göre filtreleyin.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#E5C590]">
              <span>Kataloğa Gir (Açık Erişim)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Akış & Gönderiler (The Gazette) */}
          <div 
            onClick={() => onNavigate('feed')}
            className="group p-6 rounded-2xl bg-[#121419] border border-white/[0.08] hover:border-[#E5C590]/50 transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#E5C590] group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#E5C590] transition-colors">
                Topluluk Akışı (The Gazette)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Üyelerin anlık fotoğraf dispatches'ları, gece notları ve görsel günlükleri. Beğenileri, yorumları ve paylaşımları canlı takip edin.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#E5C590]">
              <span>Akışı İncele (Açık Erişim)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Özel Partiler & Salonlar */}
          <div 
            onClick={() => onNavigate('profile')}
            className="group p-6 rounded-2xl bg-[#121419] border border-white/[0.08] hover:border-[#E5C590]/50 transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#E5C590] group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#E5C590] transition-colors">
                Özel Partiler & Salon Geceleri
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Maskeli Venedik geceleri, çatı katı kokteylleri ve gizli süit buluşmaları. Hangi üyenin hangi salonda olduğunu ve tarihleri görün.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#E5C590]">
              <span>Partileri Gör (Açık Erişim)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Şifreli Salonlar & Sohbet (Dispatches) */}
          <div 
            onClick={() => onNavigate('chat')}
            className="group p-6 rounded-2xl bg-[#121419] border border-white/[0.08] hover:border-[#E5C590]/50 transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#E5C590] group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#E5C590] transition-colors">
                Şifreli Salonlar (Dispatches)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uçtan uca şifreli birebir sohbetler ve tematik salon odaları. Saygı kuralları çerçevesinde gizli ve güvenli tanışma kanalları.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#E5C590]">
              <span>Sohbet Odalarını İncele</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. AMACIMIZ (OUR MISSION / ETHOS)
          ======================================================== */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#121419] border border-white/[0.08] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#E5C590] block">
            Manifesto & Felsefemiz
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-white font-normal">
            Neden Major Club?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            Major Club; yetişkinlerin cinsel tercihlerini, fantezilerini ve birliktelik modellerini hiçbir toplumsal baskı ve önyargı olmadan, tamamen karşılıklı rıza ve zarafet zemininde yaşaması amacıyla kurulmuştur.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="font-semibold text-white block">1. Karşılıklı Rıza</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                "Hayır" her zaman hayırdır. Tüm üyelerin sınırları ve tercihleri dokunulmazdır.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="font-semibold text-white block">2. Mutlak Gizlilik</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Kişisel verileriniz asla satılmaz, izinsiz paylaşılmaz. Takma adınız sizin zırhınızdır.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="font-semibold text-white block">3. Seçkin Komünite</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Kalabalık değil kalite odaklı; saygılı çiftler ve bireylerden oluşan özel cemiyet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SSS (SIKÇA SORULAN SORULAR / FAQ)
          ======================================================== */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C590]">
            Şeffaflık & Rehber
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#121419] border border-white/[0.08] overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="font-serif text-base text-white font-normal">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#E5C590] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-zinc-300 font-light leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          6. KÜNYE (COLOPHON & LEGAL FOOTER)
          ======================================================== */}
      <footer className="pt-10 border-t border-white/[0.08] space-y-8 text-xs font-sans text-zinc-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <img src="/major-club-logo.png" alt="MAJOR CLUB" className="h-8 w-auto object-contain" />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Major Club Société Privée — Yetişkinler için bağımsız, doğrulanmış ve şifreli özel topluluk portali.
            </p>
            <div className="text-[11px] font-mono text-zinc-500">
              © 2026 Major Club International. Tüm hakları saklıdır.
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-white font-medium text-xs block font-serif">Hızlı Bağlantılar</span>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => onNavigate('discovery')} className="hover:text-white cursor-pointer">Üye Kataloğu</button></li>
              <li><button onClick={() => onNavigate('feed')} className="hover:text-white cursor-pointer">The Gazette Akışı</button></li>
              <li><button onClick={() => onNavigate('profile')} className="hover:text-white cursor-pointer">Özel Partiler</button></li>
              <li><button onClick={() => onNavigate('chat')} className="hover:text-white cursor-pointer">Şifreli Salonlar</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-white font-medium text-xs block font-serif">Yasal & Güvenlik</span>
            <ul className="space-y-1.5 text-xs">
              <li className="text-amber-400/90 font-mono text-[11px]">🔞 18+ Yetişkin Portal Beyanı</li>
              <li className="hover:text-white cursor-pointer">Rıza ve Davranış Manifestosu</li>
              <li className="hover:text-white cursor-pointer">Gizlilik & KVKK Bildirimi</li>
              <li className="hover:text-white cursor-pointer">Kullanım Koşulları</li>
              <li className="hover:text-white cursor-pointer">Güvenlik & Şikayet Masası</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-500 leading-relaxed text-center">
          <strong>YASAL UYARI (18+):</strong> Major Club yalnızca 18 yaşını doldurmuş reşit bireylere yöneliktir. Platformda yer alan tüm içerikler karşılıklı rıza ilkesine tabidir. Fuhuş, reşit olmayan bireylerin temsili veya izinsiz görüntü paylaşımı kesinlikle yasaktır ve yasal mercilere bildirilir.
        </div>
      </footer>
    </div>
  );
};
