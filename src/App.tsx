import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useSocialPlatform } from './hooks/useSocialPlatform';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightBar } from './components/RightBar';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { ChatView } from './components/ChatView';
import { DiscoveryView } from './components/DiscoveryView';
import { AppModals } from './components/AppModals';
import { PrototypeBanner } from './components/PrototypeBanner';
import { Post, ChatMessage } from './types';
import { SupportedCurrency, SupportedLanguage } from './types/anlatiTypes';
import { noirApi } from './services/noirApi';

export function App() {
  const p = useSocialPlatform();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [currency, setCurrency] = useState<SupportedCurrency>('EUR');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll Reset strictly on primary navigation page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [p.currentView]);

  // V1 Direct Messaging (Dispatches) — 100% Realtime Database & WebSockets
  const handleSendMessage = async (
    conversationId: string, 
    text: string
  ) => {
    if (p.currentUser.isGuest) {
      p.showToast('Mesaj göndermek için lütfen giriş yapın veya üye olun.', 'info');
      p.setIsAuthOpen(true);
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
      p.setIsAuthOpen(true);
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

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F3F4F6] antialiased overflow-x-hidden w-full max-w-full selection:bg-white/20">
      <PrototypeBanner />

      {/* Top Navigation */}
      <Navbar
        currentUser={p.currentUser}
        currentView={p.currentView}
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
        onOpenAuth={() => p.setIsAuthOpen(true)}
        onLogout={p.handleLogout}
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
          onOpenCreatePost={() => {
            if (p.currentUser.isGuest) {
              p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
              p.setIsAuthOpen(true);
            } else {
              p.setIsCreatePostOpen(true);
            }
          }}
          onOpenMembershipModal={() => p.setIsMembershipModalOpen(true)}
          onOpenKYCModal={() => p.setIsKYCModalOpen(true)}
          onOpenVisitorsModal={() => p.setIsVisitorsModalOpen(true)}
          onOpenPayoutModal={() => p.setIsPayoutModalOpen(true)}
          onOpenAuth={() => p.setIsAuthOpen(true)}
          onLogout={p.handleLogout}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-5 pb-24 md:pb-8">
          {/* V1: The Gazette Feed */}
          {p.currentView === 'feed' && (
            <Feed
              currentUser={p.currentUser}
              posts={p.posts}
              isUserSubscribed={p.effectiveIsSubscribed}
              walletBalance={p.walletBalance}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={(post) => p.setSelectedCommentsPost(post)}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onSubscribeClick={() => {}}
              onUnlockPPV={() => {}}
              onShare={() => p.showToast('Dispatch link copied.', 'success')}
              onOpenCreatePost={() => {
                if (p.currentUser.isGuest) {
                  p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
                  p.setIsAuthOpen(true);
                } else {
                  p.setIsCreatePostOpen(true);
                }
              }}
              onNavigateToProfile={(userId) => {
                if (userId && userId !== p.currentUser.id) {
                  const target = p.discoveryProfiles.find(x => x.id === userId);
                  if (target) {
                    p.handleStartConversationWithProfile(target);
                    return;
                  }
                }
                p.setCurrentView('profile');
              }}
              onReportPost={(post) => p.setReportingTarget({ type: 'post', title: post.content, id: post.id })}
              onRefresh={async () => {
                const fresh = await noirApi.getPosts(p.currentUser.isGuest ? undefined : p.currentUser.id);
                p.setPosts(fresh);
                p.showToast('The Gazette refreshed from cloud archives.', 'success');
              }}
            />
          )}

          {/* V1: Member Dossier Profile */}
          {p.currentView === 'profile' && (
            <Profile
              user={p.currentUser}
              posts={p.posts.filter(item => item.author.id === p.currentUser.id)}
              walletBalance={p.walletBalance}
              isUserSubscribed={p.effectiveIsSubscribed}
              onSubscribe={() => p.setIsMembershipModalOpen(true)}
              onOpenWallet={() => p.setIsWalletOpen(true)}
              onOpenCreatePost={() => {
                if (p.currentUser.isGuest) {
                  p.showToast('Gönderi paylaşmak için lütfen giriş yapın veya üye olun.', 'info');
                  p.setIsAuthOpen(true);
                } else {
                  p.setIsCreatePostOpen(true);
                }
              }}
              onLike={p.handleLike}
              onSave={p.handleSave}
              onOpenComments={(post) => p.setSelectedCommentsPost(post)}
              onOpenMedia={(post) => p.setSelectedMediaPost(post)}
              onUnlockPPV={() => {}}
              onShare={() => p.showToast('Dossier link copied.', 'success')}
              onToast={(msg) => p.showToast(msg.text, msg.type)}
              onUpdateUser={async (updated) => {
                if (p.currentUser.isGuest) {
                  p.showToast('Profili kaydetmek için lütfen giriş yapın veya üye olun.', 'info');
                  p.setIsAuthOpen(true);
                  return;
                }
                p.setCurrentUser(prev => ({ ...prev, ...updated }));
                await noirApi.updateProfile(p.currentUser.id, updated);
                p.showToast('Dossier güncellendi ve arşive kaydedildi.', 'success');
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
              onViewProfile={() => p.setCurrentView('profile')}
            />
          )}
        </main>

        <RightBar
          walletBalance={p.walletBalance}
          isUserSubscribed={p.effectiveIsSubscribed}
          currentUser={p.currentUser}
          followingIds={p.followingIds}
          suggestedProfiles={p.discoveryProfiles}
          onFollow={p.handleFollow}
          onOpenWallet={() => p.setIsWalletOpen(true)}
          onSubscribeClick={() => p.setIsMembershipModalOpen(true)}
          onNavigateToProfile={(userId) => {
            if (userId && userId !== p.currentUser.id) {
              const target = p.discoveryProfiles.find(x => x.id === userId);
              if (target) {
                p.handleStartConversationWithProfile(target);
                return;
              }
            }
            p.setCurrentView('profile');
          }}
          onTopicClick={(tag) => {
            setSearchQuery(tag);
            p.setCurrentView('feed');
            p.showToast(`Exploring #${tag} dispatches.`, 'info');
          }}
        />
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
      <AppModals p={p} onSubmitPost={handleSubmitNewPost} />
    </div>
  );
}
export default App;
