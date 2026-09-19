import { useState, useEffect } from 'react';
import { 
  Post, 
  UserProfile, 
  Conversation, 
  PlatformEvent, 
  ForumCategory, 
  ForumTopic, 
  DiscoveryProfile, 
  ReportItem,
  Story,
  ProfileVisitor,
  AppNotification,
  ClubCommunity,
  PayoutRecord
} from '../types';
import { 
  INITIAL_POSTS, 
  CURRENT_USER, 
  INITIAL_CONVERSATIONS, 
  INITIAL_EVENTS, 
  INITIAL_FORUM_CATEGORIES, 
  INITIAL_FORUM_TOPICS, 
  INITIAL_DISCOVERY_PROFILES, 
  INITIAL_REPORTS,
  INITIAL_STORIES,
  INITIAL_VISITORS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CLUBS,
  INITIAL_PAYOUTS
} from '../data/initialData';
import { ActiveViewType } from '../components/Sidebar';
import { loadPersistentState, savePersistentState } from '../utils/storage';

export function useSocialPlatform() {
  const savedState = typeof window !== 'undefined' ? loadPersistentState() : null;

  // Navigation & UI state
  const [currentView, setCurrentView] = useState<ActiveViewType>('feed');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isVisitorsModalOpen, setIsVisitorsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<Post | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{ type: 'user' | 'post' | 'message' | 'event'; title: string; id: string } | null>(null);

  // Core Data state with LocalStorage persistence hydration
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => savedState?.currentUser || CURRENT_USER);
  const [posts, setPosts] = useState<Post[]>(() => savedState?.posts || INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [visitors, setVisitors] = useState<ProfileVisitor[]>(INITIAL_VISITORS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [clubs, setClubs] = useState<ClubCommunity[]>(() => savedState?.clubs || INITIAL_CLUBS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [walletBalance, setWalletBalance] = useState<number>(() => savedState?.walletBalance ?? 350);
  const [conversations, setConversations] = useState<Conversation[]>(() => savedState?.conversations || INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [events, setEvents] = useState<PlatformEvent[]>(() => savedState?.events || INITIAL_EVENTS);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => savedState?.forumTopics || INITIAL_FORUM_TOPICS);
  const [discoveryProfiles, setDiscoveryProfiles] = useState<DiscoveryProfile[]>(() => savedState?.discoveryProfiles || INITIAL_DISCOVERY_PROFILES);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  // Automatically sync changed state to localStorage
  useEffect(() => {
    savePersistentState({
      walletBalance,
      posts,
      clubs,
      events,
      forumTopics,
      conversations,
      currentUser,
      discoveryProfiles,
    });
  }, [walletBalance, posts, clubs, events, forumTopics, conversations, currentUser, discoveryProfiles]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toast and actions
  const effectiveIsSubscribed = currentUser.membershipTier === 'vip' || currentUser.membershipTier === 'gold';

  // Feed interactions
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      isLiked: !p.isLiked,
      likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
    } : p));
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));
    showToast('Dispatch preserved in private dossier.', 'success');
  };

  const handleUnlockPPV = (post: Post) => {
    if (post.isUnlocked) return;
    if (currentUser.membershipTier === 'vip') {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isUnlocked: true } : p));
      showToast('Privé Circle Privilege: Plate unsealed without fee.', 'success');
      return;
    }
    const price = post.unlockPrice || 15;
    if (walletBalance < price) {
      showToast(`Insufficient treasury. Unsealing requires ${price} € or equivalent.`, 'error');
      setIsWalletOpen(true);
      return;
    }
    setWalletBalance(prev => Math.max(0, prev - price));
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isUnlocked: true } : p));
    showToast(`Confidential plate unsealed for ${price} €.`, 'success');
  };

  const handleToggleClubJoin = (clubId: string) => {
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        const nextState = !c.isJoined;
        showToast(nextState ? `Initiated into "${c.name}".` : `Departed from "${c.name}".`, 'info');
        return {
          ...c,
          isJoined: nextState,
          membersCount: nextState ? c.membersCount + 1 : Math.max(0, c.membersCount - 1),
        };
      }
      return c;
    }));
  };

  const handleCompleteKYC = () => {
    setCurrentUser(prev => ({ ...prev, isVerified: true }));
    showToast('Biometric attestation confirmed. Blue seal affixed to your dossier.', 'success');
  };

  const handleStartConversationWithProfile = (profile: DiscoveryProfile) => {
    const existing = conversations.find(c => 
      c.participant.id === profile.id || 
      c.participant.username === profile.username ||
      c.participant.name === profile.name
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setCurrentView('chat');
      showToast(`Resumed encrypted dispatch with ${profile.name}.`, 'info');
      return;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participant: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        isVerified: profile.isVerified,
        membershipTier: profile.membershipTier || 'standard',
        isOnline: true,
      },
      lastMessage: 'Encrypted salon initialized.',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          conversationId: newConvId,
          senderId: profile.id,
          text: `Salutations. I observed your interest in the Registry. Delighted to connect in confidence.`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'seen',
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setCurrentView('chat');
    showToast(`Encrypted dispatch channel established with ${profile.name}.`, 'success');
  };

  const handleRequestPayout = (amount: number, iban: string, bankName: string) => {
    const fee = Math.round(amount * 0.20);
    const net = amount - fee;
    const newRecord: PayoutRecord = {
      id: `pay-${Date.now()}`,
      amount,
      netAmount: net,
      platformFee: fee,
      iban,
      bankName,
      accountHolder: currentUser.name,
      status: 'processing',
      createdAt: 'Just now',
    };
    setPayouts(prev => [newRecord, ...prev]);
    setIsPayoutModalOpen(false);
    showToast(`Wire transfer disbursement of €${net} queued for processing.`, 'success');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as reviewed.', 'info');
  };

  const handleAddStory = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
    showToast('24h Vignette published to member circle.', 'success');
  };

  return {
    currentView, setCurrentView,
    isDarkMode, setIsDarkMode,
    toastMessage, showToast,
    isWalletOpen, setIsWalletOpen,
    isMembershipModalOpen, setIsMembershipModalOpen,
    isCreatePostOpen, setIsCreatePostOpen,
    isCreateStoryOpen, setIsCreateStoryOpen,
    isKYCModalOpen, setIsKYCModalOpen,
    isVisitorsModalOpen, setIsVisitorsModalOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isPayoutModalOpen, setIsPayoutModalOpen,
    selectedMediaPost, setSelectedMediaPost,
    selectedCommentsPost, setSelectedCommentsPost,
    reportingTarget, setReportingTarget,
    currentUser, setCurrentUser,
    posts, setPosts,
    stories, setStories,
    visitors, setVisitors,
    notifications, setNotifications,
    clubs, setClubs,
    payouts, setPayouts,
    walletBalance, setWalletBalance,
    conversations, setConversations,
    activeConversationId, setActiveConversationId,
    events, setEvents,
    forumTopics, setForumTopics,
    discoveryProfiles, setDiscoveryProfiles,
    reports, setReports,
    effectiveIsSubscribed,
    handleLike, handleSave, handleUnlockPPV,
    handleToggleClubJoin, handleCompleteKYC,
    handleRequestPayout, handleMarkAllNotificationsRead,
    handleStartConversationWithProfile,
    handleAddStory,
  };
}
