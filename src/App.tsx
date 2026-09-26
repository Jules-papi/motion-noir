import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useSocialPlatform } from './hooks/useSocialPlatform';
import { Navbar } from './components/Navbar';
import { Sidebar, type ActiveViewType } from './components/Sidebar';
import { RightBar } from './components/RightBar';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { ChatView } from './components/ChatView';
import { DiscoveryView } from './components/DiscoveryView';
import { EventsView } from './components/EventsView';
import { AdminPanelView } from './components/AdminPanelView';
import { GuestLandingView } from './components/GuestLandingView';
import { AppModals } from './components/AppModals';
import { PrototypeBanner } from './components/PrototypeBanner';
import { CamouflageView } from './components/CamouflageView';
import { Post, ChatMessage, UserProfile } from './types';
import { SupportedCurrency, SupportedLanguage } from './types/anlatiTypes';
import { noirApi } from './services/noirApi';
import { isSupportedLanguage } from './utils/i18n';
import { LanguageProvider } from './i18n/LanguageContext';
import { DEFAULT_COVER_URL } from './constants/profile';
import { supabase } from './lib/supabase';
import type { AuthMode } from './components/AuthModal';

const LANGUAGE_STORAGE_KEY = 'major-club-language';

const getInitialLanguage = (): SupportedLanguage => {
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && isSupportedLanguage(saved)) return saved;

  const browserLanguage = window.navigator.language.toLowerCase().split('-')[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';
};

export function App() {
  const p = useSocialPlatform();
  const [language, setLanguage] = useState<SupportedLanguage>(getInitialLanguage);
  const [currency, setCurrency] = useState<SupportedCurrency>('EUR');
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>(() =>
    new URLSearchParams(window.location.search).has('password-recovery') ? 'recovery' : 'signin'
  );
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);
  const unreadChatCount = p.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    p.setIsAuthOpen(true);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('password-recovery')) {
      setAuthMode('recovery');
      p.setIsAuthOpen(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('recovery');
        p.setIsAuthOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [p.setIsAuthOpen]);

  useEffect(() => {
    if (!p.currentUser.isGuest && p.currentView === 'home') {
      p.setCurrentView('feed');
    }
  }, [p.currentUser.isGuest, p.currentView, p.setCurrentView]);

  const handlePrimaryNavigate = (view: ActiveViewType) => {
    if (p.currentUser.isGuest && (view === 'chat' || view === 'profile')) {
      openAuth('signin');
      return;
    }

    if (view === 'profile') setViewingProfileUser(null);
    p.setCurrentView(view);
  };

  // Unified Profile Navigation Handler: Supports visitors browsing any member
  const handleViewProfile = (userId?: string) => {
    if (!userId && p.currentUser.isGuest) {
      openAuth('signin');
      return;
    }

    if (!userId || userId === p.currentUser.id) {
      setViewingProfileUser(null);
      p.setCurrentView('profile');
      return;
    }

    // 1. Look in discovery profiles
    const disc = p.discoveryProfiles.find(d => d.id === userId);
    if (disc) {
      setViewingProfileUser({
        id: disc.id,
        name: disc.name,
        username: disc.username,
        avatar: disc.avatar,
        coverImage: disc.coverImage || DEFAULT_COVER_URL,
        bio: disc.bio,
        location: disc.city,
        website: '',
        joinDate: '2025',
        isVerified: disc.isVerified,
        isPrivate: disc.isPrivate,
        followersCount: 0,
        followingCount: 0,
        postsCount: p.posts.filter(item => item.author.id === disc.id).length,
        totalLikes: 0,
        subscriptionPrice: 0,
        membershipTier: disc.membershipTier,
        isSubscribed: false,
        isFollowing: p.followingIds.includes(disc.id),
        age: disc.age,
        gender: disc.gender,
        orientation: disc.orientation || '',
        interests: disc.interests || [],
        lookingFor: disc.lookingFor || [],
        boundaries: disc.boundaries || [],
      });
      p.setCurrentView('profile');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    // 2. Look in posts author
    const postWithAuthor = p.posts.find(item => item.author.id === userId);
    if (postWithAuthor) {
      setViewingProfileUser({
        id: postWithAuthor.author.id,
        name: postWithAuthor.author.name,
        username: postWithAuthor.author.username,
        avatar: postWithAuthor.author.avatar,
        coverImage: DEFAULT_COVER_URL,
        bio: '',
        location: '',
        website: '',
        joinDate: '2025',
        isVerified: !!postWithAuthor.author.isVerified,
        isPrivate: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: p.posts.filter(item => item.author.id === userId).length,
        totalLikes: 0,
        subscriptionPrice: 0,
        membershipTier: 'standard',
        isSubscribed: false,
        isFollowing: p.followingIds.includes(userId),
        gender: 'unspecified',
        orientation: '',
        interests: [],
        lookingFor: [],
        boundaries: [],
      });
      p.setCurrentView('profile');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    // Fallback
    setViewingProfileUser(null);
    p.setCurrentView('profile');
  };

  // Scroll Reset strictly on primary navigation page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [p.currentView]);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  // V1 Direct Messaging (Dispatches) — 100% Realtime Database & WebSockets
  const handleSendMessage = async (
    conversationId: string,
    text: string
  ) => {
    if (p.currentUser.isGuest) {
      p.showToast('Mesaj göndermek için lütfen giriş yapın veya üye olun.', 'info');
      openAuth('signin');
      return;
    }

    const targetId = conversationId || p.activeConversationId;
    if (!targetId || !text.trim()) return;

    // Optimistic local state update for instant UI feedback
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: targetId,
      senderId: p.currentUser.id,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    p.setConversations(prev => prev.map(c => c.id === targetId ? {
      ...c,
      messages: [...c.messages, tempMsg],
      lastMessage: text,
      lastMessageTime: 'Just now',
    } : c));

    try {
      // Send directly to PostgreSQL noir_messages table via Supabase
      await noirApi.sendMessage(targetId, p.currentUser.id, text);
    } catch (err) {
      console.error('Failed to deliver dispatch to Supabase:', err);
      p.showToast('Dispatch failed to transmit to the salon server.', 'error');
    }
  };

  // V1 Create Post (The Gazette) — 100% Realtime PostgreSQL Insertion
  const handleSubmitNewPost = async (postData: Partial<Post>) => {
    if (p.currentUser.isGuest) {
      p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
      openAuth('signin');
      return;
    }

    if (!postData.content && !postData.mediaUrl) return;

    try {
      p.showToast('Transmitting dispatch to the Gazette...', 'info');
      const created = await noirApi.createPost({
        authorId: p.currentUser.id,
        content: postData.content || '',
        type: postData.type || (postData.mediaUrl ? 'photo' : 'text'),
        mediaUrl: postData.mediaUrl,
        isSensitive: postData.isSensitive ?? false,
      });

      if (created) {
        p.setPosts(prev => [created, ...prev.filter(x => x.id !== created.id)]);
        p.setIsCreatePostOpen(false);
        p.showToast('Your dispatch was archived in The Gazette.', 'success');
      }
    } catch (err) {
      console.error('Error submitting dispatch:', err);
      p.showToast('Could not save dispatch to database.', 'error');
    }
  };

  // Global Discreet Camouflage Hotkey (Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isAnyModalOpen = p.isAuthOpen || p.isCreatePostOpen || p.selectedMediaPost || p.selectedCommentsPost || p.reportingTarget;
        if (!isAnyModalOpen) {
          p.toggleCamouflageMode();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [p.isAuthOpen, p.isCreatePostOpen, p.selectedMediaPost, p.selectedCommentsPost, p.reportingTarget, p.toggleCamouflageMode]);

  if (p.isCamouflageMode) {
    return <CamouflageView onExitCamouflage={p.toggleCamouflageMode} />;
  }

  return (
    <LanguageProvider language={language}>
    <div className="min-h-screen bg-[#09090B] text-[#F1EFEA] antialiased overflow-x-hidden w-full max-w-full selection:bg-[#C5A880]/15 selection:text-[#F1EFEA]">
      <PrototypeBanner />

      {/* Top Navigation */}
      <Navbar
        currentUser={p.currentUser}
        currentView={p.currentView}
        unreadChatCount={unreadChatCount}
        unreadNotificationsCount={p.notifications.filter(n => !n.isRead).length}
        currency={currency}
        language={language}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCurrencyChange={setCurrency}
        onLanguageChange={setLanguage}
        onOpenCreatePost={() => p.setIsCreatePostOpen(true)}
        onOpenNotifications={() => p.setIsNotificationsOpen(true)}
        onOpenAuth={() => openAuth('signin')}
        onLogout={p.handleLogout}
        onToggleCamouflage={p.toggleCamouflageMode}
        onNavigate={handlePrimaryNavigate}
      />

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto flex">
        <Sidebar
          currentView={p.currentView}
          onNavigate={handlePrimaryNavigate}
          currentUser={p.currentUser}
          unreadChatCount={unreadChatCount}
          onOpenCreatePost={() => {
            if (p.currentUser.isGuest) {
              p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
              openAuth('signin');
            } else {
              p.setIsCreatePostOpen(true);
            }
          }}
          onOpenAuth={() => openAuth('signin')}
          onLogout={p.handleLogout}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-5 pb-24 md:pb-8">
          {/* Guest Portal Landing View (Hero, Infographic, Categories Grid, Ethos, FAQ, Imprint) */}
          {p.currentView === 'home' && p.currentUser.isGuest && (
            <GuestLandingView
              onNavigate={handlePrimaryNavigate}
              onOpenAuth={() => openAuth('signup')}
              onViewProfile={(userId) => handleViewProfile(userId)}
              profiles={p.discoveryProfiles}
            />
          )}

          {/* V1: The Gazette Feed */}
          {(p.currentView === 'feed' || (p.currentView === 'home' && !p.currentUser.isGuest)) && (
            <Feed
              currentUser={p.currentUser}
              posts={p.posts}
              isUserSubscribed={p.effectiveIsSubscribed}
              walletBalance={p.walletBalance}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={async (post) => {
                p.setSelectedCommentsPost(post);
                try {
                  const dbComments = await noirApi.getComments(post.id);
                  p.setSelectedCommentsPost(prev => prev && prev.id === post.id ? {
                    ...prev,
                    comments: dbComments,
                    commentsCount: dbComments.length > 0 ? dbComments.length : prev.commentsCount,
                  } : prev);
                } catch (cErr) {
                  console.warn('Error fetching comments for modal:', cErr);
                }
              }}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onSubscribeClick={() => {}}
              onUnlockPPV={() => {}}
              onShare={() => p.showToast('Dispatch link copied.', 'success')}
              onOpenCreatePost={() => {
                if (p.currentUser.isGuest) {
                  p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
                  openAuth('signin');
                } else {
                  p.setIsCreatePostOpen(true);
                }
              }}
              onNavigateToProfile={(userId) => handleViewProfile(userId)}
              onReportPost={(post) => p.setReportingTarget({ type: 'post', title: post.content, id: post.id })}
              onRefresh={async () => {
                const fresh = await noirApi.getPosts(p.currentUser.isGuest ? undefined : p.currentUser.id);
                p.setPosts(fresh);
                p.showToast('The Gazette refreshed from cloud archives.', 'success');
              }}
              hasMorePosts={p.hasMorePosts}
              isLoadingMore={p.isLoadingMorePosts}
              onLoadMore={p.loadMorePosts}
              onDeletePost={p.handleDeletePost}
            />
          )}

          {/* V1: Member Dossier Profile */}
          {p.currentView === 'profile' && (
            <Profile
              user={viewingProfileUser || p.currentUser}
              currentUser={p.currentUser}
              posts={p.posts.filter(item => item.author.id === (viewingProfileUser ? viewingProfileUser.id : p.currentUser.id))}
              walletBalance={p.walletBalance}
              isUserSubscribed={p.effectiveIsSubscribed}
              isFollowing={viewingProfileUser ? p.followingIds.includes(viewingProfileUser.id) : false}
              onSubscribe={() => p.setIsMembershipModalOpen(true)}
              onOpenWallet={() => p.setIsWalletOpen(true)}
              onOpenCreatePost={() => {
                if (p.currentUser.isGuest) {
                  p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
                  openAuth('signin');
                } else {
                  p.setIsCreatePostOpen(true);
                }
              }}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={async (post) => {
                p.setSelectedCommentsPost(post);
                try {
                  const dbComments = await noirApi.getComments(post.id);
                  p.setSelectedCommentsPost(prev => prev && prev.id === post.id ? {
                    ...prev,
                    comments: dbComments,
                    commentsCount: dbComments.length > 0 ? dbComments.length : prev.commentsCount,
                  } : prev);
                } catch (cErr) {
                  console.warn('Error fetching comments for profile modal:', cErr);
                }
              }}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onUnlockPPV={() => {}}
              onShare={() => p.showToast('Profil bağlantısı kopyalandı.', 'success')}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
              onBack={() => {
                setViewingProfileUser(null);
                p.setCurrentView('feed');
              }}
              onToggleFollow={(id) => p.handleFollow(id)}
              onStartChat={(targetUser) => {
                const discTarget = p.discoveryProfiles.find(d => d.id === targetUser.id) || {
                  id: targetUser.id,
                  name: targetUser.name,
                  username: targetUser.username,
                  avatar: targetUser.avatar,
                  bio: targetUser.bio,
                  coverImage: targetUser.coverImage || DEFAULT_COVER_URL,
                  age: targetUser.age,
                  gender: targetUser.gender || 'unspecified',
                  orientation: targetUser.orientation,
                  city: targetUser.location || '',
                  isOnline: true,
                  isVerified: targetUser.isVerified,
                  membershipTier: targetUser.membershipTier,
                  interests: targetUser.interests || [],
                  lookingFor: targetUser.lookingFor || [],
                  boundaries: targetUser.boundaries || [],
                  matchRate: 0,
                };
                p.handleStartConversationWithProfile(discTarget);
              }}
              onOpenAuth={() => openAuth('signin')}
              onUpdateUser={async (updated) => {
                if (p.currentUser.isGuest) {
                  p.showToast('Profili kaydetmek için lütfen giriş yapın veya üye olun.', 'info');
                  openAuth('signin');
                  return false;
                }
                try {
                  const success = await noirApi.updateProfile(p.currentUser.id, updated);
                  if (success) {
                    p.setCurrentUser(prev => ({ ...prev, ...updated }));
                    p.showToast('Profil güncellendi ve kaydedildi.', 'success');
                    return true;
                  } else {
                    p.showToast('Profil güncellenemedi. Lütfen bilgilerinizi kontrol edin.', 'error');
                    return false;
                  }
                } catch (err: any) {
                  p.showToast(err?.message || 'Güncelleme sırasında hata oluştu.', 'error');
                  return false;
                }
              }}
            />
          )}

          {/* V1: Direct Messaging Dispatches */}
          {p.currentView === 'chat' && (
            <ChatView
              currentUser={p.currentUser}
              conversations={p.conversations}
              activeConversationId={p.activeConversationId}
              onSendMessage={handleSendMessage}
              onReportUser={(u) => p.setReportingTarget({ type: 'user', title: u.name, id: u.id })}
              onMarkConversationAsRead={p.handleMarkConversationAsRead}
            />
          )}

          {/* V1: The Registry Discovery */}
          {p.currentView === 'discovery' && (
            <DiscoveryView
              profiles={p.discoveryProfiles}
              currentUser={p.currentUser}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onStartChat={(profile) => {
                p.handleStartConversationWithProfile(profile);
              }}
              onViewProfile={(userId) => handleViewProfile(userId)}
            />
          )}

          {/* Events & Calendar System */}
          {p.currentView === 'events' && (
            <EventsView
              events={p.events}
              currentUser={p.currentUser}
              walletBalance={p.walletBalance}
              isUserSubscribed={p.effectiveIsSubscribed}
              currency={currency}
              language={language}
              onApplyToEvent={(event, data) => {
                p.handleRegisterForEvent(event.id, {
                  participationType: data.participationType as any,
                  note: data.note,
                });
              }}
              onPayForTicket={(event) => {
                p.handleRegisterForEvent(event.id, {
                  participationType: 'couple',
                  note: 'Direct Admission Payment',
                });
              }}
              onSignNdaForEvent={(eventId) => p.handleSignNda(eventId)}
              onCheckIn={(eventId) => p.handleCheckInAttendee(eventId)}
              onCreateEvent={p.handleCreateEvent}
              onSaveEvent={p.handleSaveEvent}
              onCancelRegistration={p.handleCancelRegistration}
              onApproveEventApplication={(eventId, applicantName) => {
                p.showToast(`${applicantName || 'Üye'} başvurusu onaylandı.`, 'success');
              }}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
            />
          )}

          {/* High Curatorship & Governance Admin Panel */}
          {p.currentView === 'admin' && (
            <AdminPanelView
              currentUser={p.currentUser}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
              onEventApproved={p.loadEvents}
              onNavigateHome={() => handlePrimaryNavigate('feed')}
            />
          )}
        </main>

        {p.currentView !== 'chat' && p.currentView !== 'admin' && !(p.currentView === 'home' && p.currentUser.isGuest) && (
          <RightBar
            currentUser={p.currentUser}
            currentView={p.currentView}
            followingIds={p.followingIds}
            suggestedProfiles={p.discoveryProfiles}
            onFollow={p.handleFollow}
            onOpenAuth={() => openAuth('signup')}
            onNavigateToProfile={(userId) => handleViewProfile(userId)}
            onNavigateToDiscovery={() => p.setCurrentView('discovery')}
          />
        )}
      </div>

      {/* Floating Toast Notification */}
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
      <AppModals p={p} authMode={authMode} onRequestAuth={() => openAuth('signin')} onSubmitPost={handleSubmitNewPost} />
    </div>
    </LanguageProvider>
  );
}
export default App;
