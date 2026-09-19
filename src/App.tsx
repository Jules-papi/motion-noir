import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useSocialPlatform } from './hooks/useSocialPlatform';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightBar } from './components/RightBar';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { ChatView } from './components/ChatView';
import { EventsView } from './components/EventsView';
import { ClubsView } from './components/ClubsView';
import { ForumView } from './components/ForumView';
import { DiscoveryView } from './components/DiscoveryView';
import { AdminPanelView } from './components/AdminPanelView';
import { AppModals } from './components/AppModals';
import { PrototypeBanner } from './components/PrototypeBanner';
import { INITIAL_FORUM_CATEGORIES } from './data/initialData';
import { Post, PlatformEvent, ForumTopic, ChatMessage } from './types';
import { SupportedCurrency, SupportedLanguage } from './types/anlatiTypes';

export function App() {
  const p = useSocialPlatform();
  const [language, setLanguage] = useState<SupportedLanguage>('tr');
  const [currency, setCurrency] = useState<SupportedCurrency>('EUR');
  const [searchQuery, setSearchQuery] = useState('');

  // P0-3: Scroll Reset strictly on primary navigation page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [p.currentView]);

  // Chat message sender
  const handleSendMessage = (
    conversationId: string, 
    text: string, 
    isAudio?: boolean,
    audioDetails?: { blobUrl?: string; duration?: string; waveform?: number[] }
  ) => {
    const targetId = conversationId || p.activeConversationId;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: targetId,
      senderId: p.currentUser.id,
      text,
      isAudio,
      audioDuration: audioDetails?.duration || (isAudio ? '0:07' : undefined),
      audioBlobUrl: audioDetails?.blobUrl,
      audioWaveform: audioDetails?.waveform,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    p.setConversations(prev => prev.map(c => c.id === targetId ? {
      ...c,
      messages: [...c.messages, newMsg],
      lastMessage: text || (isAudio ? '🎙️ Encrypted Voice Note' : 'Confidential Plate'),
      lastMessageTime: 'Just now',
    } : c));

    setTimeout(() => {
      let autoReply = '';
      let replySenderId = 'partner';

      if (targetId === 'conv-concierge') {
        replySenderId = 'concierge-bot';
        const lower = text.toLowerCase();
        if (lower.includes('etkinlik') || lower.includes('hafta sonu') || lower.includes('event')) {
          autoReply = `🍸 **Bu Hafta Sonu Küratör Seçkisi:**\n\n1. **Amsterdam Secret Villa — Eşli Lifestyle & Swinger Party** (Noord, Isıtmalı Havuz, 38 Çift + 10 Tek Kadın, Başvuru Onaylı)\n2. **Berlin Privé Masquerade & Dark Romanticism** (Mitte, Siyah İpek & Maske, Canlı DJ)\n3. **Rotterdam Sensual Noir Penthouse** (Erasmusbrug manzaralı, 25 seçkin üye)\n\nEtkinlikler sekmesinden başvurunuzu yapabilir, onaylandıktan sonra QR biletinizi cüzdanınıza alabilirsiniz.`;
        } else if (lower.includes('kulüp') || lower.includes('loca') || lower.includes('club')) {
          autoReply = `🗝️ **Özel Kulüp & Loca Tavsiyesi:**\n\nAmsterdam Nocturne Club ve Amsterdam Darkroom & Fetish Circle üyelerimize özel VIP localar sunmaktadır. Masaya şampanya servisi ve özel oda erişimi için profilinizin doğrulanmış olması ve dijital NDA onayınız gereklidir.`;
        } else if (lower.includes('stil') || lower.includes('profil') || lower.includes('fotoğraf')) {
          autoReply = `✨ **Kişisel Profil Kürasyon Önerileri:**\n\n• Profil fotoğrafınızda monokrom / loş ışık estetiği etkileşimi %40 artırıyor.\n• Özel ve mahrem fotoğraflarınızı "Intimate / Confidential" olarak işaretleyip PPV (Confidential Plate) kilidi koyabilirsiniz.\n• KYC kimlik doğrulamanızı tamamlayarak Gold/VIP rozetine geçiş yapmanızı öneririm.`;
        } else if (lower.includes('nda') || lower.includes('güvenlik') || lower.includes('gizlilik')) {
          autoReply = `📜 **Maison Noir Gizlilik & NDA Güvencesi:**\n\n• Tüm salon etkinliklerinde dijital NDA sözleşmesi zorunludur.\n• Mekan kapılarında kamera mühürleme ve sıfır fotoğraf kuralı uygulanır.\n• Sohbette paylaştığınız "1x Ephemeral" fotoğraflar 5 saniye sonra kalıcı olarak imha edilir.`;
        } else if (lower.includes('vip') || lower.includes('üyelik') || lower.includes('ayrıcalık')) {
          autoReply = `💎 **VIP & Privé Üyelik Ayrıcalıkları:**\n\n• Seçkin kulüp etkinliklerine %100 ücretsiz VIP katılım hakkı\n• Sınırsız PPV ve kilitli patron hikayeleri\n• 7/24 Öncelikli Concierge Masa Desteği\n• Sıfır komisyonlu IBAN banka transfer çekimleri.`;
        } else if (isAudio) {
          autoReply = `🎙️ Sesli kaydınızı dinledim. Talebinizi salon arşivine kaydettim. Özel rezervasyonunuz ve tercih ettiğiniz etkinlik türü için en uygun davetiyeleri hazırlıyorum.`;
        } else {
          autoReply = `Talebinizi aldım sayın ${p.currentUser.name}. Maison Noir salonlarında kusursuz bir deneyim yaşamanız için buradayım. Size etkinlik davetiyesi, özel kulüp locası veya üyelik konusunda nasıl yardımcı olabilirim?`;
        }
      } else {
        autoReply = isAudio 
          ? 'Voice note deciphered. Elegant resonance. Looking forward to our encounter.'
          : 'Delighted to receive your dispatch in the salon. Discretion assured.';
      }

      const replyMsg: ChatMessage = {
        id: `msg-rep-${Date.now()}`,
        conversationId: targetId,
        senderId: replySenderId,
        text: autoReply,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen',
      };
      p.setConversations(prev => prev.map(c => c.id === targetId ? {
        ...c,
        messages: [...c.messages, replyMsg],
        lastMessage: autoReply.substring(0, 45) + '...',
        lastMessageTime: 'Just now',
      } : c));
    }, 1200);
  };

  // Event lifecycle handlers: Apply -> Approval & Notification -> Payment (if paid) / Direct QR (if free)
  const handleApplyToEvent = (ev: PlatformEvent, data: { participationType: string; note: string }) => {
    p.setEvents(prev => prev.map(e => e.id === ev.id ? {
      ...e,
      applicationStatus: 'pending',
    } : e));
    p.showToast(`"${ev.title}" için katılma isteğiniz alındı. İncelendikten sonra bildirim alacaksınız.`, 'success');
  };

  const handleApproveEventApplication = (eventId: string, applicantName?: string) => {
    const targetEv = p.events.find(e => e.id === eventId);
    if (!targetEv) return;

    const finalPrice = (targetEv.vipFree && p.effectiveIsSubscribed) ? 0 : targetEv.price;
    const isFree = finalPrice === 0;

    p.setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      applicationStatus: isFree ? 'paid' : 'approved_unpaid',
      isUserRegistered: isFree ? true : e.isUserRegistered,
      ticketCode: isFree ? `VIP-AMS-${Math.floor(1000 + Math.random() * 9000)}` : e.ticketCode,
      attendeesCount: isFree ? e.attendeesCount + 1 : e.attendeesCount,
    } : e));

    // Send notification to user
    p.setNotifications(prev => [
      {
        id: `notif-appr-${Date.now()}`,
        type: 'event_approval',
        title: '🎉 Başvurunuz Onaylandı!',
        message: `"${targetEv.title}" etkinliği için katılım başvurunuz onaylandı. ${isFree ? 'Ücretsiz biletiniz ve QR kodunuz hazır!' : `Bilet ücretini (${finalPrice} ₺) ödeyerek QR kodunuzu hemen alabilirsiniz.`}`,
        isRead: false,
        createdAt: 'Az önce',
      },
      ...prev,
    ]);

    p.showToast(`🎉 "${targetEv.title}" başvurusu onaylandı ve bildirim gönderildi!`, 'success');
  };

  const handlePayForTicket = (ev: PlatformEvent) => {
    if (ev.applicationStatus === 'pending') {
      // Demo convenience: allow instant approval
      handleApproveEventApplication(ev.id);
      return;
    }

    const finalPrice = (ev.vipFree && p.effectiveIsSubscribed) ? 0 : ev.price;
    if (finalPrice > 0 && p.walletBalance < finalPrice) {
      p.showToast(`Yetersiz bakiye! Bilet için ${finalPrice} ₺ gerekiyor.`, 'error');
      p.setIsWalletOpen(true);
      return;
    }

    if (finalPrice > 0) {
      p.setWalletBalance(prev => prev - finalPrice);
    }

    p.setEvents(prev => prev.map(e => e.id === ev.id ? {
      ...e,
      applicationStatus: 'paid',
      isUserRegistered: true,
      attendeesCount: e.attendeesCount + 1,
      ticketCode: `VIP-AMS-${Math.floor(1000 + Math.random() * 9000)}`,
    } : e));

    p.setNotifications(prev => [
      {
        id: `notif-pay-${Date.now()}`,
        type: 'event_approval',
        title: '🎟️ Bilet Temin Edildi',
        message: `"${ev.title}" etkinliği için giriş QR kodunuz hazırlandı. Giriş ekranından görüntüleyebilirsiniz.`,
        isRead: false,
        createdAt: 'Az önce',
      },
      ...prev,
    ]);

    p.showToast(`🎟️ "${ev.title}" biletiniz temin edildi! QR kodunuz hazır.`, 'success');
  };

  const handleSignNdaForEvent = (eventId: string) => {
    p.setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isNdaSigned: true,
    } : e));
    p.setNotifications(prev => [
      {
        id: `notif-nda-${Date.now()}`,
        type: 'event_approval',
        title: '✍️ Dijital Rıza Sözleşmesi İmzalandı',
        message: 'Hollanda Yetişkin Etkinlikleri mevzuatına uygun Dijital Gizlilik & Rıza Sözleşmesi (NDA) onayınız sisteme kaydedildi.',
        isRead: false,
        createdAt: 'Az önce',
      },
      ...prev,
    ]);
  };

  // Create post
  const handleSubmitNewPost = (postData: Partial<Post>) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: p.currentUser,
      content: postData.content || '',
      type: postData.type || 'text',
      mediaUrl: postData.mediaUrl,
      isSubscribersOnly: !!postData.isSubscribersOnly,
      isPPV: !!postData.isPPV,
      unlockPrice: postData.unlockPrice,
      isUnlocked: true,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: 'Az önce',
    };
    p.setPosts(prev => [newPost, ...prev]);
    p.setIsCreatePostOpen(false);
    p.showToast('Yeni gönderiniz yayınlandı!', 'success');
  };

  const handleTipPost = (post: Post, amount: number) => {
    if (p.walletBalance < amount) {
      p.showToast(`Yetersiz bakiye! Bahşiş göndermek için kasaya en az ${amount} € yükleyin.`, 'error');
      p.setIsWalletOpen(true);
      return;
    }
    p.setWalletBalance(prev => prev - amount);
    p.showToast(`✨ ${post.author.name} adlı üyeye ${amount} € bahşiş iletildi!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F3F4F6] antialiased overflow-x-hidden w-full max-w-full selection:bg-white/20">
      {/* Interactive Prototype Banner */}
      <PrototypeBanner />

      {/* Top Navigation */}
      <Navbar
        currentUser={p.currentUser}
        walletBalance={p.walletBalance}
        isUserSubscribed={p.effectiveIsSubscribed}
        unreadNotificationsCount={p.notifications.filter(n => !n.isRead).length}
        currency={currency}
        language={language}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCurrencyChange={setCurrency}
        onLanguageChange={setLanguage}
        onOpenWallet={() => p.setIsWalletOpen(true)}
        onOpenCreatePost={() => p.setIsCreatePostOpen(true)}
        onOpenMembershipModal={() => p.setIsMembershipModalOpen(true)}
        onOpenNotifications={() => p.setIsNotificationsOpen(true)}
        onNavigate={p.setCurrentView}
        isDarkMode={p.isDarkMode}
        onToggleDarkMode={() => p.setIsDarkMode(!p.isDarkMode)}
      />

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto flex">
        <Sidebar
          currentView={p.currentView}
          onNavigate={p.setCurrentView}
          currentUser={p.currentUser}
          walletBalance={p.walletBalance}
          isUserSubscribed={p.effectiveIsSubscribed}
          language={language}
          currency={currency}
          onOpenWallet={() => p.setIsWalletOpen(true)}
          onOpenCreatePost={() => p.setIsCreatePostOpen(true)}
          onOpenMembershipModal={() => p.setIsMembershipModalOpen(true)}
          onOpenKYCModal={() => p.setIsKYCModalOpen(true)}
          onOpenVisitorsModal={() => p.setIsVisitorsModalOpen(true)}
          onOpenPayoutModal={() => p.setIsPayoutModalOpen(true)}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-5 pb-24 md:pb-8">
          {p.currentView === 'feed' && (
            <Feed
              currentUser={p.currentUser}
              posts={p.posts}
              stories={p.stories}
              isUserSubscribed={p.effectiveIsSubscribed}
              walletBalance={p.walletBalance}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={(post) => p.setSelectedCommentsPost(post)}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onSubscribeClick={() => p.setIsMembershipModalOpen(true)}
              onUnlockPPV={p.handleUnlockPPV}
              onShare={() => p.showToast('Bağlantı kopyalandı!', 'success')}
              onTip={handleTipPost}
              onOpenCreatePost={() => p.setIsCreatePostOpen(true)}
              onOpenCreateStory={() => p.setIsCreateStoryOpen(true)}
              onNavigateToProfile={() => p.setCurrentView('profile')}
              onReportPost={(post) => p.setReportingTarget({ type: 'post', title: post.content, id: post.id })}
            />
          )}

          {p.currentView === 'profile' && (
            <Profile
              user={p.currentUser}
              posts={p.posts.filter(item => item.author.id === p.currentUser.id)}
              walletBalance={p.walletBalance}
              isUserSubscribed={p.effectiveIsSubscribed}
              onSubscribe={() => p.setIsMembershipModalOpen(true)}
              onOpenWallet={() => p.setIsWalletOpen(true)}
              onOpenCreatePost={() => p.setIsCreatePostOpen(true)}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={(post) => p.setSelectedCommentsPost(post)}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onUnlockPPV={p.handleUnlockPPV}
              onShare={() => p.showToast('Bağlantı kopyalandı!', 'success')}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
            />
          )}

          {p.currentView === 'chat' && (
            <ChatView
              currentUser={p.currentUser}
              conversations={p.conversations}
              activeConversationId={p.activeConversationId}
              onSendMessage={handleSendMessage}
              onReportUser={(u) => p.setReportingTarget({ type: 'user', title: u.name, id: u.id })}
            />
          )}

          {p.currentView === 'events' && (
            <EventsView
              events={p.events}
              currentUser={p.currentUser}
              walletBalance={p.walletBalance}
              isUserSubscribed={p.effectiveIsSubscribed}
              currency={currency}
              language={language}
              onApplyToEvent={handleApplyToEvent}
              onPayForTicket={handlePayForTicket}
              onSignNdaForEvent={handleSignNdaForEvent}
              onApproveEventApplication={handleApproveEventApplication}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
              onCheckIn={(id) => {
                p.setEvents(prev => prev.map(e => e.id === id ? { ...e, isCheckedIn: true } : e));
                p.showToast('Giriş QR check-in yapıldı!', 'success');
              }}
              onCreateEvent={(ev) => {
                const newEv: PlatformEvent = {
                  id: `ev-${Date.now()}`,
                  title: ev.title || 'Yeni Buluşma',
                  description: ev.description || '',
                  category: ev.category || 'party',
                  city: ev.city || 'Amsterdam',
                  venue: ev.venue || 'Mekan',
                  address: ev.address || 'Amsterdam Centrum',
                  coverImage: ev.coverImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
                  capacity: 80,
                  attendeesCount: 1,
                  price: ev.price || 0,
                  vipFree: true,
                  startsAt: 'Cuma, 22:00',
                  endsAt: 'Cumartesi, 04:00',
                  isUserRegistered: false,
                  applicationStatus: 'none',
                  participationTarget: 'all',
                  isNetherlandsHosted: true,
                  orientationNotice: 'Çiftler, Tekil Kadın & Erkek ve Üçlü Katılıma Açık',
                  isCheckedIn: false,
                  organizer: { name: p.currentUser.name, username: p.currentUser.username, avatar: p.currentUser.avatar, isVerified: true },
                };
                p.setEvents(prev => [newEv, ...prev]);
                p.showToast('Etkinliğiniz yayınlandı!', 'success');
              }}
            />
          )}

          {p.currentView === 'clubs' && (
            <ClubsView
              clubs={p.clubs}
              currentUser={p.currentUser}
              onToggleJoin={p.handleToggleClubJoin}
              onOpenClubChat={(club) => {
                p.setCurrentView('chat');
                p.showToast(`"${club.name}" grup sohbetine bağlandınız.`, 'info');
              }}
            />
          )}

          {p.currentView === 'forum' && (
            <ForumView
              categories={INITIAL_FORUM_CATEGORIES}
              topics={p.forumTopics}
              currentUser={p.currentUser}
              onUpvoteTopic={(id) => p.setForumTopics(prev => prev.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))}
              onAddReply={(topicId, content) => {
                const rep = { id: `rep-${Date.now()}`, topicId, author: p.currentUser, content, createdAt: 'Şimdi', upvotes: 0 };
                p.setForumTopics(prev => prev.map(t => t.id === topicId ? { ...t, replies: [...t.replies, rep], repliesCount: t.repliesCount + 1 } : t));
                p.showToast('Yanıtınız eklendi!', 'success');
              }}
              onCreateTopic={(tp) => {
                const newTopic: ForumTopic = {
                  id: `top-${Date.now()}`,
                  categoryId: tp.categoryId,
                  title: tp.title,
                  content: tp.content,
                  author: p.currentUser,
                  tags: tp.tags,
                  createdAt: 'Şimdi',
                  upvotes: 1,
                  downvotes: 0,
                  repliesCount: 0,
                  viewsCount: 1,
                  replies: [],
                };
                p.setForumTopics(prev => [newTopic, ...prev]);
                p.showToast('Forum konusu açıldı!', 'success');
              }}
              onReportTopic={(t) => p.setReportingTarget({ type: 'post', title: t.title, id: t.id })}
            />
          )}

          {p.currentView === 'discovery' && (
            <DiscoveryView
              profiles={p.discoveryProfiles}
              currentUser={p.currentUser}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onStartChat={(profile) => {
                p.handleStartConversationWithProfile(profile);
              }}
              onViewProfile={() => p.setCurrentView('profile')}
            />
          )}

          {p.currentView === 'admin' && (
            <AdminPanelView
              reports={p.reports}
              onTakeAction={(id, actionType) => {
                p.setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'action_taken' } : r));
                const report = p.reports.find(r => r.id === id);
                if (report) {
                  if (report.targetType === 'post') {
                    p.setPosts(prev => prev.filter(post => post.id !== report.targetId));
                  } else if (report.targetType === 'user') {
                    p.setDiscoveryProfiles(prev => prev.filter(prof => prof.id !== report.targetId));
                  }
                }
                p.showToast(
                  actionType === 'ban' 
                    ? 'Patron excommunicated & dossiers quarantined.' 
                    : 'Content censored and record updated.', 
                  'success'
                );
              }}
              onDismissReport={(id) => {
                p.setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
                p.showToast('Report dismissed as unfounded.', 'info');
              }}
            />
          )}
        </main>

        <RightBar
          walletBalance={p.walletBalance}
          isUserSubscribed={p.effectiveIsSubscribed}
          currentUser={p.currentUser}
          registeredEvents={p.events.filter(e => e.isUserRegistered)}
          onOpenWallet={() => p.setIsWalletOpen(true)}
          onSubscribeClick={() => p.setIsMembershipModalOpen(true)}
          onNavigateToProfile={() => p.setCurrentView('profile')}
          onNavigateToEvents={() => p.setCurrentView('events')}
          onNavigateToForum={() => p.setCurrentView('forum')}
        />
      </div>

      {/* Floating Toast Notification (P0-2: mobile top safe-area, desktop bottom-right) */}
      {p.toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 sm:top-auto sm:bottom-8 sm:right-6 sm:left-auto sm:max-w-sm z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2.5 border transition-all animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 duration-200 ${
            p.toastMessage.type === 'success' ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-950/20' :
            p.toastMessage.type === 'error' ? 'bg-rose-600/95 text-white border-rose-400 shadow-rose-950/20' :
            'bg-zinc-900/95 text-white border-zinc-700 shadow-black/30'
          }`}
        >
          {p.toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />}
          {p.toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-200" />}
          {(!p.toastMessage.type || p.toastMessage.type === 'info') && <Info className="w-4 h-4 shrink-0 text-zinc-300" />}
          <span className="flex-1 leading-snug">{p.toastMessage.text}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <AppModals p={p} onSubmitPost={handleSubmitNewPost} />
    </div>
  );
}
export default App;
