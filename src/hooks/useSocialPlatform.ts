import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Post,
  UserProfile,
  Conversation,
  DiscoveryProfile,
  ReportItem,
  AppNotification,
  ChatMessage,
  PlatformEvent,
  EventCategory,
  EventAttendee,
  EventFilters,
  CreateEventPayload,
  RegistrationPayload
} from '../types';
import { ActiveViewType } from '../components/Sidebar';
import { noirApi } from '../services/noirApi';
import { supabase } from '../lib/supabase';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '../constants/profile';

// Default guest patron profile for seamless browsing without auth lock
const DEFAULT_GUEST_PATRON: UserProfile = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Misafir Patron',
  username: 'misafir',
  isGuest: true,
  avatar: DEFAULT_AVATAR_URL,
  coverImage: DEFAULT_COVER_URL,
  bio: 'Major Club portal ziyaretçisi. Özel salon içerikleri ve üye profilleri için giriş yapın.',
  location: 'Avrupa / Türkiye',
  website: '',
  joinDate: '2025',
  isVerified: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  totalLikes: 0,
  subscriptionPrice: 0,
  membershipTier: 'standard',
  isSubscribed: false,
  isFollowing: false,
  gender: 'unspecified',
  interests: [],
  lookingFor: [],
  boundaries: [],
};

export function useSocialPlatform() {
  // Navigation & UI state: Defaults to portal landing page for visitors / guests
  const [currentView, setCurrentView] = useState<ActiveViewType>('home');
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
  const [isCamouflageMode, setIsCamouflageMode] = useState(false);
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<Post | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{ type: 'user' | 'post' | 'message' | 'event'; title: string; id: string } | null>(null);

  // Core Data state (Live Supabase)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_GUEST_PATRON);
  const [posts, setPosts] = useState<Post[]>([]);
  const [discoveryProfiles, setDiscoveryProfiles] = useState<DiscoveryProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Events & Calendar subsystem
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PlatformEvent | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

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
        const mappedDiscovery: DiscoveryProfile[] = dbProfiles.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          bio: p.bio,
          coverImage: p.coverImage,
          age: p.age,
          gender: p.gender || 'unspecified',
          orientation: p.orientation,
          city: p.location || '',
          distanceKm: undefined,
          isOnline: true,
          isVerified: p.isVerified,
          isPrivate: p.isPrivate,
          membershipTier: p.membershipTier,
          interests: p.interests || [],
          lookingFor: p.lookingFor || [],
          boundaries: p.boundaries || [],
          matchRate: 0,
        }));
        setDiscoveryProfiles(mappedDiscovery);

        // Identify current user
        if (authUser) {
          const matched = dbProfiles.find(p => p.id === authUser.id);
          if (matched) {
            setCurrentUser({ ...matched, isGuest: false });
          } else {
            setCurrentUser({
              ...DEFAULT_GUEST_PATRON,
              id: authUser.id,
              name: authUser.email?.split('@')[0] || 'Member',
              username: (authUser.email?.split('@')[0] || 'member').toLowerCase(),
              isGuest: false,
            });
          }
        } else {
          setCurrentUser(DEFAULT_GUEST_PATRON);
        }
      }

      // Load live posts with current user's liked and saved flags
      const activeUserId = authUser?.id || undefined;
      const dbPosts = await noirApi.getPosts(activeUserId);
      setPosts(dbPosts);

      // Load follows & notifications if logged in
      if (authUser?.id) {
        const [follows, notifs] = await Promise.all([
          noirApi.getFollowingIds(authUser.id),
          noirApi.getNotifications(authUser.id),
        ]);
        setFollowingIds(follows);
        setNotifications(notifs);
      }

      // Load events & categories from Supabase
      try {
        const [dbEvents, cats, savedEvtIds] = await Promise.all([
          noirApi.getEvents(undefined, activeUserId),
          noirApi.getEventCategories(),
          activeUserId ? noirApi.getSavedEventIds(activeUserId) : Promise.resolve([]),
        ]);
        setEvents(dbEvents);
        setEventCategories(cats);
        setSavedEventIds(savedEvtIds);
      } catch (evtErr) {
        console.warn('Failed to load initial events:', evtErr);
      }

    } catch (err) {
      console.error('Failed to load initial Supabase data:', err);
      showToast('Connecting to Major Club cloud database...', 'info');
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const dbProfiles = await noirApi.getProfiles();
        const matched = dbProfiles.find(p => p.id === session.user.id);
        if (matched) {
          setCurrentUser({ ...matched, isGuest: false });
        }
        const follows = await noirApi.getFollowingIds(session.user.id);
        setFollowingIds(follows);
        const notifs = await noirApi.getNotifications(session.user.id);
        setNotifications(notifs);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser({ ...DEFAULT_GUEST_PATRON, isGuest: true });
        setFollowingIds([]);
        setConversations([]);
        setActiveConversationId('');
        setNotifications([]);
        setSavedEventIds([]);
        setSelectedEvent(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser.id || currentUser.isGuest) return;

    const unsubscribe = noirApi.subscribeToNotifications(currentUser.id, notification => {
      setNotifications(previous => {
        if (previous.some(item => item.id === notification.id)) return previous;
        return [notification, ...previous];
      });
      showToast(notification.title, 'info');
    });

    return unsubscribe;
  }, [currentUser.id, currentUser.isGuest]);

  useEffect(() => {
    if (!isNotificationsOpen || currentUser.isGuest) return;
    noirApi.getNotifications(currentUser.id).then(setNotifications);
  }, [isNotificationsOpen, currentUser.id, currentUser.isGuest]);

  const currentUserRef = useRef(currentUser);
  const currentViewRef = useRef(currentView);
  const activeConversationIdRef = useRef(activeConversationId);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // 2. Load conversations when currentUser changes
  useEffect(() => {
    if (!currentUser?.id || currentUser.isGuest) return;
    noirApi.getConversations(currentUser.id).then(convs => {
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    });
  }, [currentUser?.id, currentUser?.isGuest]);

  // 3. Supabase Realtime WebSockets: Listen for new posts & messages
  useEffect(() => {
    const unsubscribePosts = noirApi.subscribeToPosts((newPost) => {
      setPosts(prev => {
        if (prev.some(p => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
      showToast('New dispatch posted in The Gazette.', 'info');
    });

    const unsubscribeMessages = noirApi.subscribeToMessages(async (newMsg: ChatMessage) => {
      if (!conversationsRef.current.some(conversation => conversation.id === newMsg.conversationId)) {
        const userId = currentUserRef.current.id;
        if (!currentUserRef.current.isGuest && userId) {
          const refreshed = await noirApi.getConversations(userId);
          setConversations(refreshed);
        }
        return;
      }
      setConversations(prev => {
        return prev.map(c => {
          if (c.id === newMsg.conversationId) {
            if (c.messages.some(m => m.id === newMsg.id)) return c;

            const isConversationOpen = currentViewRef.current === 'chat' && activeConversationIdRef.current === c.id;
            const isFromOtherUser = !currentUserRef.current.isGuest && newMsg.senderId !== currentUserRef.current.id;

            if (isConversationOpen && isFromOtherUser) {
              noirApi.markConversationAsRead(c.id);
            }

            const shouldIncrement = isFromOtherUser && !isConversationOpen;

            return {
              ...c,
              unreadCount: shouldIncrement ? (c.unreadCount || 0) + 1 : (isConversationOpen ? 0 : c.unreadCount),
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

  const handleMarkConversationAsRead = useCallback(async (conversationId: string) => {
    if (!conversationId || currentUser.isGuest) return;
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
    await noirApi.markConversationAsRead(conversationId);
  }, [currentUser.isGuest]);

  // Feed interactions (Live in Supabase)
  const handleLike = async (postId: string) => {
    if (currentUser.isGuest) {
      showToast('Gönderileri beğenmek için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const currentlyLiked = !!post.isLiked;

    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      isLiked: !currentlyLiked,
      likesCount: currentlyLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
    } : p));

    try {
      await noirApi.toggleLikePost(postId, currentUser.id, currentlyLiked);
    } catch (err) {
      console.error('Error liking post:', err);
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        isLiked: currentlyLiked,
        likesCount: currentlyLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      } : p));
      showToast('Beğeni kaydedilemedi. Lütfen tekrar deneyin.', 'error');
    }
  };

  const handleSave = async (postId: string) => {
    if (currentUser.isGuest) {
      showToast('Gönderileri kaydetmek için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }

    const post = posts.find(p => p.id === postId);
    const currentlySaved = !!post?.isSaved;

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: !currentlySaved } : p));
    try {
      const isSavedNow = await noirApi.toggleSavePost(currentUser.id, postId, currentlySaved);
      showToast(isSavedNow ? 'Gönderi kaydedildi.' : 'Gönderi kaydedilenlerden çıkarıldı.', 'success');
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (currentUser.isGuest) {
      showToast('Üyeleri takip etmek için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }

    const isFollowing = followingIds.includes(targetUserId);

    try {
      if (isFollowing) {
        const success = await noirApi.unfollowUser(currentUser.id, targetUserId);
        if (!success) throw new Error('Takip bırakılamadı.');
        setFollowingIds(prev => prev.filter(id => id !== targetUserId));
        showToast('Takip bırakıldı.', 'info');
      } else {
        const status = await noirApi.followUser(currentUser.id, targetUserId);
        if (!status) throw new Error('Takip işlemi kaydedilemedi.');
        if (status === 'accepted') {
          setFollowingIds(prev => prev.includes(targetUserId) ? prev : [...prev, targetUserId]);
          showToast('Üye takip ediliyor.', 'success');
        } else {
          showToast('Takip isteği gönderildi.', 'success');
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      showToast('Takip işlemi tamamlanamadı.', 'error');
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMorePosts || !hasMorePosts) return;
    setIsLoadingMorePosts(true);
    try {
      const currentCount = posts.length;
      const nextPosts = await noirApi.getPosts(
        currentUser.isGuest ? undefined : currentUser.id,
        20,
        currentCount
      );
      if (nextPosts.length < 20) {
        setHasMorePosts(false);
      }
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const unique = nextPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...unique];
      });
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setIsLoadingMorePosts(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const success = await noirApi.deletePost(postId);
      if (success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        showToast('Gönderi arşivden silindi.', 'success');
      } else {
        showToast('Gönderi silinemedi.', 'error');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      showToast('Gönderi silinirken hata oluştu.', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      const success = await noirApi.deleteComment(commentId);
      if (success) {
        setSelectedCommentsPost(prev => {
          if (!prev || prev.id !== postId) return prev;
          const updatedComments = (prev.comments || []).filter(c => c.id !== commentId);
          return {
            ...prev,
            comments: updatedComments,
            commentsCount: Math.max(0, (prev.commentsCount || 1) - 1),
          };
        });
        setPosts(prev => prev.map(p => p.id === postId ? {
          ...p,
          commentsCount: Math.max(0, p.commentsCount - 1),
        } : p));
        showToast('Yorum silindi.', 'success');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser({ ...DEFAULT_GUEST_PATRON, isGuest: true });
      setFollowingIds([]);
      setConversations([]);
      setActiveConversationId('');
      setNotifications([]);
      showToast('Oturum kapatıldı. Ziyaretçi olarak serbestçe gezinebilirsiniz.', 'info');
    } catch (err) {
      console.error('Error logging out:', err);
      showToast('Çıkış yapılırken bir hata oluştu.', 'error');
    }
  };

  // Start or resume real conversation with profile in Supabase
  const handleStartConversationWithProfile = async (profile: DiscoveryProfile) => {
    if (currentUser.isGuest) {
      showToast('Üyelerle mesajlaşmak için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }

    try {
      showToast(`Establishing encrypted channel with ${profile.name}...`, 'info');
      const convId = await noirApi.getOrCreateConversation(currentUser.id, profile.id);

      const updatedConvs = await noirApi.getConversations(currentUser.id);
      setConversations(updatedConvs);
      setActiveConversationId(convId);
      setCurrentView('chat');
    } catch (err) {
      console.error('Error starting conversation:', err);
      showToast('Could not initiate conversation channel.', 'error');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (!currentUser.isGuest) {
      await noirApi.markAllNotificationsAsRead(currentUser.id);
    }
    showToast('Tüm bildirimler okundu olarak işaretlendi.', 'info');
  };

  const handleSelectNotification = async (notification: AppNotification) => {
    setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, isRead: true } : item));
    setIsNotificationsOpen(false);
    if (!currentUser.isGuest && !notification.isRead) {
      try {
        await noirApi.markNotificationAsRead(notification.id, currentUser.id);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const handleRespondToFollowRequest = async (notification: AppNotification, accept: boolean) => {
    if (!notification.actorId || currentUser.isGuest) return;
    try {
      const success = await noirApi.respondToFollowRequest(notification.actorId, accept);
      if (!success) throw new Error('Takip isteği artık aktif değil.');
      setNotifications(prev => prev.filter(item => item.id !== notification.id));
      showToast(accept ? 'Takip isteği kabul edildi.' : 'Takip isteği reddedildi.', 'success');
    } catch (err) {
      console.error('Error responding to follow request:', err);
      showToast('Takip isteği güncellenemedi.', 'error');
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (currentUser.isGuest) {
      showToast('Yorum yapmak için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      text,
      createdAt: 'Şimdi',
      likes: 0,
      isLiked: false,
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: p.comments ? [...p.comments, optimisticComment] : [optimisticComment],
        };
      }
      return p;
    }));

    if (selectedCommentsPost && selectedCommentsPost.id === postId) {
      setSelectedCommentsPost(prev => prev ? {
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
        comments: prev.comments ? [...prev.comments, optimisticComment] : [optimisticComment],
      } : null);
    }

    try {
      const realComment = await noirApi.addComment(postId, currentUser.id, text);
      if (realComment) {
        showToast('Yorumunuz paylaşıldı.', 'success');
      }
    } catch (err) {
      console.error('Error adding comment to DB:', err);
      showToast('Yorum eklenirken hata oluştu.', 'error');
    }
  };

  // -------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------
  const loadEvents = useCallback(async (filters?: EventFilters) => {
    setIsLoadingEvents(true);
    try {
      const activeUserId = currentUserRef.current.isGuest ? undefined : currentUserRef.current.id;
      const [fetchedEvents, cats, savedIds] = await Promise.all([
        noirApi.getEvents(filters, activeUserId),
        eventCategories.length === 0 ? noirApi.getEventCategories() : Promise.resolve(eventCategories),
        activeUserId ? noirApi.getSavedEventIds(activeUserId) : Promise.resolve([]),
      ]);
      setEvents(fetchedEvents);
      if (cats.length > 0) setEventCategories(cats);
      if (savedIds.length > 0) setSavedEventIds(savedIds);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [eventCategories]);

  const handleSaveEvent = async (eventId: string) => {
    if (currentUser.isGuest) {
      showToast('Etkinliği kaydetmek için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }
    const isCurrentlySaved = savedEventIds.includes(eventId);
    // Optimistic toggle
    setSavedEventIds(prev => isCurrentlySaved ? prev.filter(id => id !== eventId) : [...prev, eventId]);
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isSaved: !isCurrentlySaved,
      savesCount: (e.savesCount || 0) + (isCurrentlySaved ? -1 : 1),
    } : e));

    try {
      await noirApi.toggleSaveEvent(eventId, isCurrentlySaved);
      showToast(isCurrentlySaved ? 'Etkinlik kaydedilenlerden çıkarıldı.' : 'Etkinlik ajandanıza kaydedildi.', 'success');
    } catch (err: any) {
      // Rollback
      setSavedEventIds(prev => isCurrentlySaved ? [...prev, eventId] : prev.filter(id => id !== eventId));
      setEvents(prev => prev.map(e => e.id === eventId ? {
        ...e,
        isSaved: isCurrentlySaved,
        savesCount: (e.savesCount || 0) + (isCurrentlySaved ? 1 : -1),
      } : e));
      showToast('İşlem başarısız oldu.', 'error');
    }
  };

  const handleRegisterForEvent = async (eventId: string, payload: RegistrationPayload) => {
    if (currentUser.isGuest) {
      showToast('Etkinliğe katılmak için lütfen giriş yapın veya üye olun.', 'info');
      setIsAuthOpen(true);
      return;
    }
    try {
      const attendee = await noirApi.registerForEvent(eventId, payload);
      if (attendee) {
        setEvents(prev => prev.map(e => e.id === eventId ? {
          ...e,
          isUserRegistered: attendee.status !== 'cancelled',
          applicationStatus: attendee.status,
          ticketCode: attendee.ticketCode,
          attendeesCount: attendee.status === 'approved' ? e.attendeesCount + 1 : e.attendeesCount,
        } : e));
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => prev ? {
            ...prev,
            isUserRegistered: attendee.status !== 'cancelled',
            applicationStatus: attendee.status,
            ticketCode: attendee.ticketCode,
          } : null);
        }
        showToast(
          attendee.status === 'approved'
            ? 'Başvurunuz onaylandı! Giriş kartınız oluşturuldu.'
            : 'Başvurunuz alındı ve salon küratörlerine iletildi.',
          'success'
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Başvuru sırasında hata oluştu.', 'error');
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    try {
      const ok = await noirApi.cancelRegistration(eventId);
      if (ok) {
        setEvents(prev => prev.map(e => e.id === eventId ? {
          ...e,
          isUserRegistered: false,
          applicationStatus: 'none',
          ticketCode: undefined,
          attendeesCount: e.applicationStatus === 'approved' ? Math.max(0, e.attendeesCount - 1) : e.attendeesCount,
        } : e));
        showToast('Etkinlik kaydınız iptal edildi.', 'info');
      }
    } catch (err: any) {
      showToast('İptal işlemi başarısız oldu.', 'error');
    }
  };

  const handleCreateEvent = async (payload: CreateEventPayload) => {
    if (currentUser.isGuest) {
      showToast('Etkinlik oluşturmak için lütfen giriş yapın.', 'info');
      setIsAuthOpen(true);
      return;
    }
    try {
      const created = await noirApi.createEvent(payload);
      if (created) {
        setEvents(prev => [created, ...prev]);
        setIsCreateEventOpen(false);
        showToast('Yeni salon etkinliği başarıyla yayınlandı.', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Etkinlik oluşturulurken hata oluştu.', 'error');
    }
  };

  const handleApproveRegistration = async (attendeeId: string, eventId?: string) => {
    try {
      const ok = await noirApi.approveRegistration(attendeeId);
      if (ok) {
        if (eventId) {
          setEvents(prev => prev.map(e => e.id === eventId ? {
            ...e,
            attendeesCount: e.attendeesCount + 1,
          } : e));
        }
        showToast('Başvuru onaylandı ve davet kodu üretildi.', 'success');
      }
    } catch (err: any) {
      showToast('Onaylama işlemi başarısız oldu.', 'error');
    }
  };

  const handleRejectRegistration = async (attendeeId: string) => {
    try {
      const ok = await noirApi.rejectRegistration(attendeeId);
      if (ok) {
        showToast('Başvuru reddedildi.', 'info');
      }
    } catch (err: any) {
      showToast('İşlem başarısız oldu.', 'error');
    }
  };

  const handleCheckInAttendee = async (attendeeOrEventId: string) => {
    try {
      const ok = await noirApi.checkInAttendee(attendeeOrEventId, currentUser.id);
      if (ok) {
        setEvents(prev => prev.map(e => e.id === attendeeOrEventId ? { ...e, isCheckedIn: true } : e));
        showToast('Üye girişi (Check-in) başarıyla kaydedildi.', 'success');
      }
    } catch (err: any) {
      showToast('Giriş teyidi başarısız oldu.', 'error');
    }
  };

  const handleSignNda = async (eventId: string) => {
    try {
      const ok = await noirApi.signEventNda(eventId);
      if (ok) {
        setEvents(prev => prev.map(e => e.id === eventId ? {
          ...e,
          isNdaSigned: true,
        } : e));
        showToast('Gizlilik Sözleşmesi (NDA) onaylandı.', 'success');
      }
    } catch (err: any) {
      showToast('NDA imzalanamadı.', 'error');
    }
  };

  const toggleCamouflageMode = () => {
    setIsCamouflageMode(prev => {
      const next = !prev;
      showToast(next ? 'Kamufle Modu devrede (Esc ile dönebilirsiniz).' : 'Major Club Portalı geri yüklendi.', 'info');
      return next;
    });
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
    isCamouflageMode, setIsCamouflageMode,
    toggleCamouflageMode,
    selectedMediaPost, setSelectedMediaPost,
    selectedCommentsPost, setSelectedCommentsPost,
    reportingTarget, setReportingTarget,
    currentUser, setCurrentUser,
    posts, setPosts,
    notifications, setNotifications,
    followingIds, setFollowingIds,
    handleFollow,
    walletBalance: 0,
    conversations, setConversations,
    activeConversationId, setActiveConversationId,
    discoveryProfiles, setDiscoveryProfiles,
    reports, setReports,
    isLoadingInitial,
    effectiveIsSubscribed: true,
    handleLike, handleSave,
    handleAddComment,
    handleDeleteComment,
    handleDeletePost,
    hasMorePosts,
    isLoadingMorePosts,
    loadMorePosts,
    handleLogout,
    handleMarkAllNotificationsRead,
    handleSelectNotification,
    handleRespondToFollowRequest,
    handleStartConversationWithProfile,
    handleMarkConversationAsRead,
    events, setEvents,
    eventCategories, setEventCategories,
    selectedEvent, setSelectedEvent,
    savedEventIds, setSavedEventIds,
    isCreateEventOpen, setIsCreateEventOpen,
    isLoadingEvents,
    loadEvents,
    handleSaveEvent,
    handleRegisterForEvent,
    handleCancelRegistration,
    handleCreateEvent,
    handleApproveRegistration,
    handleRejectRegistration,
    handleCheckInAttendee,
    handleSignNda,
  };
}
