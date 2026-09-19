import { useState, useEffect, useCallback } from 'react';
import { 
  Post, 
  UserProfile, 
  Conversation, 
  PlatformEvent, 
  DiscoveryProfile, 
  ReportItem, 
  AppNotification, 
  ChatMessage 
} from '../types';
import { ActiveViewType } from '../components/Sidebar';
import { noirApi } from '../services/noirApi';
import { supabase } from '../lib/supabase';

// Default initial patron fallback before first DB load
const DEFAULT_PATRON: UserProfile = {
  id: '44444444-4444-4444-4444-444444444444',
  name: 'Julian Vane',
  username: 'julian_v',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
  bio: 'Founder & Senior Curator at Maison Noir. Discretion is paramount.',
  location: 'Amsterdam Oud-Zuid',
  website: '',
  joinDate: 'Oct 2024',
  isVerified: true,
  followersCount: 1420,
  followingCount: 380,
  postsCount: 18,
  totalLikes: 4200,
  subscriptionPrice: 0,
  membershipTier: 'standard',
  isSubscribed: false,
  isFollowing: false,
  age: 31,
  gender: 'male',
  orientation: 'Straight',
};

export function useSocialPlatform() {
  // Navigation & UI state
  const [currentView, setCurrentView] = useState<ActiveViewType>('feed');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isVisitorsModalOpen, setIsVisitorsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<Post | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{ type: 'user' | 'post' | 'message' | 'event'; title: string; id: string } | null>(null);

  // Core Data state (Live Supabase)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PATRON);
  const [posts, setPosts] = useState<Post[]>([]);
  const [discoveryProfiles, setDiscoveryProfiles] = useState<DiscoveryProfile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load from Supabase Live Database
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoadingInitial(true);

      // Check current auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData.session?.user;

      // Load all live profiles
      const dbProfiles = await noirApi.getProfiles();

      if (dbProfiles.length > 0) {
        // Map to DiscoveryProfile format
        const mappedDiscovery: DiscoveryProfile[] = dbProfiles.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          bio: p.bio,
          age: p.age || 28,
          gender: (p.gender as any) || 'woman',
          city: p.location || 'Amsterdam',
          distanceKm: Math.floor(2 + Math.random() * 8),
          isOnline: true,
          isVerified: p.isVerified,
          membershipTier: p.membershipTier,
          interests: ['Art', 'Noir', 'Private Salons'],
          matchRate: 92,
        }));
        setDiscoveryProfiles(mappedDiscovery);

        // Identify current user
        if (authUser) {
          const matched = dbProfiles.find(p => p.id === authUser.id);
          if (matched) {
            setCurrentUser(matched);
          }
        } else {
          // If no auth, default to Julian Vane or first profile
          const julian = dbProfiles.find(p => p.username === 'julian_v') || dbProfiles[0];
          if (julian) setCurrentUser(julian);
        }
      }

      // Load live posts
      const dbPosts = await noirApi.getPosts();
      setPosts(dbPosts);

    } catch (err) {
      console.error('Failed to load initial Supabase data:', err);
      showToast('Connecting to Maison Noir cloud database...', 'info');
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Load conversations when currentUser changes
  useEffect(() => {
    if (!currentUser?.id) return;
    noirApi.getConversations(currentUser.id).then(convs => {
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    });
  }, [currentUser?.id]);

  // 3. Supabase Realtime WebSockets: Listen for new posts & messages
  useEffect(() => {
    // Realtime posts
    const unsubscribePosts = noirApi.subscribeToPosts((newPost) => {
      setPosts(prev => {
        if (prev.some(p => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
      showToast('New dispatch posted in The Gazette.', 'info');
    });

    // Realtime messages
    const unsubscribeMessages = noirApi.subscribeToMessages((newMsg: ChatMessage) => {
      setConversations(prev => {
        return prev.map(c => {
          if (c.id === newMsg.conversationId) {
            // Check if message already exists
            if (c.messages.some(m => m.id === newMsg.id)) return c;
            return {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text || 'Photo Dispatch',
              lastMessageTime: newMsg.createdAt,
            };
          }
          return c;
        });
      });
    });

    return () => {
      unsubscribePosts();
      unsubscribeMessages();
    };
  }, []);

  // Feed interactions (Live in Supabase)
  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const currentlyLiked = !!post.isLiked;

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      isLiked: !currentlyLiked,
      likesCount: currentlyLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
    } : p));

    try {
      await noirApi.toggleLikePost(postId, currentUser.id, currentlyLiked);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));
    showToast('Dispatch preserved in private dossier.', 'success');
  };

  // Start or resume real conversation with profile in Supabase
  const handleStartConversationWithProfile = async (profile: DiscoveryProfile) => {
    try {
      showToast(`Establishing encrypted channel with ${profile.name}...`, 'info');
      const convId = await noirApi.getOrCreateConversation(currentUser.id, profile.id);
      
      // Refresh conversations
      const updatedConvs = await noirApi.getConversations(currentUser.id);
      setConversations(updatedConvs);
      setActiveConversationId(convId);
      setCurrentView('chat');
    } catch (err) {
      console.error('Error starting conversation:', err);
      showToast('Could not initiate conversation channel.', 'error');
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as reviewed.', 'info');
  };

  return {
    currentView, setCurrentView,
    isDarkMode, setIsDarkMode,
    toastMessage, showToast,
    isAuthOpen, setIsAuthOpen,
    isWalletOpen, setIsWalletOpen,
    isMembershipModalOpen, setIsMembershipModalOpen,
    isCreatePostOpen, setIsCreatePostOpen,
    isKYCModalOpen, setIsKYCModalOpen,
    isVisitorsModalOpen, setIsVisitorsModalOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isPayoutModalOpen, setIsPayoutModalOpen,
    selectedMediaPost, setSelectedMediaPost,
    selectedCommentsPost, setSelectedCommentsPost,
    reportingTarget, setReportingTarget,
    currentUser, setCurrentUser,
    posts, setPosts,
    notifications, setNotifications,
    walletBalance: 0,
    conversations, setConversations,
    activeConversationId, setActiveConversationId,
    discoveryProfiles, setDiscoveryProfiles,
    reports, setReports,
    isLoadingInitial,
    effectiveIsSubscribed: true,
    handleLike, handleSave,
    handleMarkAllNotificationsRead,
    handleStartConversationWithProfile,
  };
}
