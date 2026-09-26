import { supabase } from '../lib/supabase';
import { UserProfile, Post, Comment, Conversation, ChatMessage, AppNotification, PlatformEvent, EventCategory, EventAttendee, EventComment, EventFilters, CreateEventPayload, RegistrationPayload, Venue, OrganizerApplication } from '../types';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '../constants/profile';

const mapNotification = (notification: any): AppNotification => ({
  id: notification.id,
  actorId: notification.actor_id || undefined,
  type: notification.type || 'system',
  title: notification.title,
  message: notification.content || '',
  isRead: notification.is_read,
  createdAt: new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export const noirApi = {
  // -------------------------------------------------------------
  // PROFILES
  // -------------------------------------------------------------
  async getProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('noir_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching noir_profiles:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name || 'Member',
      username: item.username || 'member',
      avatar: item.avatar || DEFAULT_AVATAR_URL,
      coverImage: item.cover_image || DEFAULT_COVER_URL,
      bio: item.bio || '',
      location: item.location || '',
      website: '',
      joinDate: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isVerified: !!item.is_verified,
      isPrivate: item.is_private ?? false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      totalLikes: 0,
      subscriptionPrice: 0,
      membershipTier: 'standard',
      isSubscribed: false,
      isFollowing: false,
      age: item.age ?? undefined,
      gender: item.gender || '',
      orientation: item.orientation || '',
      interests: item.interests || [],
      lookingFor: item.looking_for || [],
      boundaries: item.boundaries || [],
    }));
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.orientation !== undefined) payload.orientation = updates.orientation;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
    if (updates.interests !== undefined) payload.interests = updates.interests;
    if (updates.lookingFor !== undefined) payload.looking_for = updates.lookingFor;
    if (updates.boundaries !== undefined) payload.boundaries = updates.boundaries;
    if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate;

    const { error } = await supabase
      .from('noir_profiles')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating profile:', error);
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        throw new Error('Bu kullanıcı adı zaten başka bir üye tarafından kullanılıyor.');
      }
      return false;
    }
    return true;
  },

  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
    const payload = {
      id: profile.id,
      name: profile.name || 'Anonymous Patron',
      username: profile.username || `patron_${profile.id.slice(0, 6)}`,
      avatar: profile.avatar || DEFAULT_AVATAR_URL,
      cover_image: profile.coverImage || DEFAULT_COVER_URL,
      bio: profile.bio || '',
      location: profile.location || '',
      age: profile.age ?? null,
      gender: profile.gender || 'unspecified',
      orientation: profile.orientation || '',
      interests: profile.interests || [],
      looking_for: profile.lookingFor || [],
      boundaries: profile.boundaries || [],
      is_verified: profile.isVerified ?? false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('noir_profiles')
      .upsert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error('Error upserting profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      avatar: data.avatar,
      coverImage: data.cover_image || DEFAULT_COVER_URL,
      bio: data.bio,
      location: data.location,
      website: '',
      joinDate: 'Recent',
      isVerified: data.is_verified,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      totalLikes: 0,
      subscriptionPrice: 0,
      membershipTier: 'standard',
      isSubscribed: false,
      isFollowing: false,
      age: data.age,
      gender: data.gender,
      orientation: data.orientation,
      interests: data.interests || [],
      lookingFor: data.looking_for || [],
      boundaries: data.boundaries || [],
    };
  },

  // -------------------------------------------------------------
  // POSTS (The Gazette)
  // -------------------------------------------------------------
  async getPosts(currentUserId?: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('noir_posts')
      .select(`
        *,
        author:noir_profiles!noir_posts_author_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      console.error('Error fetching noir_posts:', error);
      return [];
    }

    let likedIds: string[] = [];
    let savedIds: string[] = [];

    if (currentUserId && currentUserId !== '44444444-4444-4444-4444-444444444444') {
      try {
        const [likesRes, savesRes] = await Promise.all([
          supabase.from('noir_post_likes').select('post_id').eq('user_id', currentUserId),
          supabase.from('noir_post_saves').select('post_id').eq('user_id', currentUserId),
        ]);
        if (likesRes.data) likedIds = likesRes.data.map(x => x.post_id);
        if (savesRes.data) savedIds = savesRes.data.map(x => x.post_id);
      } catch (err) {
        console.warn('Could not fetch likes/saves for user:', err);
      }
    }

    return data.map(p => ({
      id: p.id,
      author: {
        id: p.author?.id || p.author_id,
        name: p.author?.name || 'Maison Patron',
        username: p.author?.username || 'patron',
        avatar: p.author?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!p.author?.is_verified,
      },
      type: p.type || 'photo',
      content: p.content,
      mediaUrl: p.media_url,
      likesCount: p.likes_count || 0,
      commentsCount: p.comments_count || 0,
      sharesCount: 0,
      isLiked: likedIds.includes(p.id),
      isSaved: savedIds.includes(p.id),
      isSensitive: !!p.is_sensitive,
      createdAt: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  },

  async createPost(post: { authorId?: string; content: string; type?: string; mediaUrl?: string; isSensitive?: boolean }): Promise<Post | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Gönderi paylaşmak için oturum açmalısınız.');
    }
    const verifiedAuthorId = user.id;

    const { data, error } = await supabase
      .from('noir_posts')
      .insert({
        author_id: verifiedAuthorId,
        content: post.content,
        type: post.type || (post.mediaUrl ? 'photo' : 'text'),
        media_url: post.mediaUrl,
        is_sensitive: post.isSensitive ?? false,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        author:noir_profiles!noir_posts_author_id_fkey(*)
      `)
      .single();

    if (error || !data) {
      console.error('Error creating post:', error);
      return null;
    }

    return {
      id: data.id,
      author: {
        id: data.author?.id || data.author_id,
        name: data.author?.name || 'Maison Patron',
        username: data.author?.username || 'patron',
        avatar: data.author?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!data.author?.is_verified,
      },
      type: data.type || 'text',
      content: data.content,
      mediaUrl: data.media_url,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      isSensitive: !!data.is_sensitive,
      createdAt: 'Just now',
    };
  },

  async deletePost(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // STORAGE & MEDIA UPLOADS (STRICT USER ISOLATION & VALIDATION)
  // -------------------------------------------------------------
  async uploadImage(file: File | Blob, folder: string = 'media'): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Görsel yüklemek için giriş yapmış olmalısınız.');
      }

      // 1. MIME Whitelist
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type)) {
        throw new Error('Desteklenmeyen görsel formatı. Yalnızca JPEG, PNG ve WebP kabul edilir.');
      }

      // 2. Maximum File Size (5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('Görsel boyutu 5MB sınırını aşamaz.');
      }

      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };
      const cleanExt = extMap[file.type] || 'jpg';
      const filename = `users/${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

      const { data, error } = await supabase.storage
        .from('noir-media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error || !data) {
        console.error('Storage upload error:', error);
        return null;
      }

      const { data: pubData } = supabase.storage.from('noir-media').getPublicUrl(data.path);
      return pubData.publicUrl;
    } catch (err: any) {
      console.error('Upload exception:', err);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // LIKES (The Gazette — ATOMIC TRIGGER-SYNCHRONIZED)
  // -------------------------------------------------------------
  async toggleLikePost(postId: string, _userId: string, currentlyLiked: boolean): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Beğeni yapmak için giriş yapmalısınız.');
    const activeUserId = user.id;

    if (currentlyLiked) {
      const { error } = await supabase
        .from('noir_post_likes')
        .delete()
        .match({ post_id: postId, user_id: activeUserId });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('noir_post_likes')
        .upsert(
          { post_id: postId, user_id: activeUserId },
          { onConflict: 'post_id,user_id', ignoreDuplicates: true }
        );
      if (error) throw error;
    }

    // Atomic count maintained by Postgres trigger
    const { data: postData } = await supabase
      .from('noir_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return postData?.likes_count ?? 0;
  },

  async getLikedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_post_likes')
      .select('post_id')
      .eq('user_id', userId);
    if (error || !data) {
      console.error('Error fetching liked posts:', error);
      return [];
    }
    return data.map(r => r.post_id);
  },

  // -------------------------------------------------------------
  // SAVES / BOOKMARKS (The Gazette)
  // -------------------------------------------------------------
  async toggleSavePost(_userId: string, postId: string, currentlySaved: boolean): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kaydetmek için giriş yapmalısınız.');
    const activeUserId = user.id;

    if (currentlySaved) {
      const { error } = await supabase
        .from('noir_post_saves')
        .delete()
        .match({ user_id: activeUserId, post_id: postId });
      return error ? true : false;
    } else {
      const { error } = await supabase
        .from('noir_post_saves')
        .upsert(
          { user_id: activeUserId, post_id: postId },
          { onConflict: 'user_id,post_id', ignoreDuplicates: true }
        );
      return error ? false : true;
    }
  },

  async getSavedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_post_saves')
      .select('post_id')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map(r => r.post_id);
  },

  async getSavedPosts(userId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('noir_post_saves')
      .select(`
        post_id,
        post:noir_posts(
          *,
          author:noir_profiles!noir_posts_author_id_fkey(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching saved posts:', error);
      return [];
    }

    return data
      .filter((item: any) => item.post)
      .map((item: any) => {
        const p = item.post;
        return {
          id: p.id,
          author: {
            id: p.author?.id || p.author_id,
            name: p.author?.name || 'Maison Patron',
            username: p.author?.username || 'patron',
            avatar: p.author?.avatar || DEFAULT_AVATAR_URL,
            isVerified: !!p.author?.is_verified,
          },
          type: p.type || 'photo',
          content: p.content,
          mediaUrl: p.media_url,
          likesCount: p.likes_count || 0,
          commentsCount: p.comments_count || 0,
          sharesCount: 0,
          isLiked: false,
          isSaved: true,
          isSensitive: !!p.is_sensitive,
          createdAt: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
  },

  // -------------------------------------------------------------
  // FOLLOW SYSTEM (The Registry / Network)
  // -------------------------------------------------------------
  async followUser(_followerId: string, followingId: string): Promise<'accepted' | 'pending' | false> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const activeFollowerId = user.id;

    const { data, error } = await supabase
      .from('noir_follows')
      .upsert(
        { follower_id: activeFollowerId, following_id: followingId },
        { onConflict: 'follower_id,following_id' }
      )
      .select('status')
      .single();
    if (error || !data) {
      console.error('Error following member:', error);
      return false;
    }
    return data.status === 'pending' ? 'pending' : 'accepted';
  },

  async unfollowUser(_followerId: string, followingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const activeFollowerId = user.id;

    const { error } = await supabase
      .from('noir_follows')
      .delete()
      .match({ follower_id: activeFollowerId, following_id: followingId });
    return !error;
  },

  async getFollowingIds(followerId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_follows')
      .select('following_id')
      .eq('follower_id', followerId)
      .eq('status', 'accepted');
    if (error || !data) return [];
    return data.map(r => r.following_id);
  },

  async getFollowersCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('noir_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .eq('status', 'accepted');
    if (error || count === null) return 0;
    return count;
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('noir_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data.map(mapNotification);
  },

  async createNotification(params: {
    userId: string;
    actorId?: string;
    type: string;
    title: string;
    content?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from('noir_notifications').insert({
        user_id: params.userId,
        actor_id: params.actorId || null,
        type: params.type,
        title: params.title,
        content: params.content || '',
        is_read: false,
      });
      if (error) throw error;
    } catch (err) {
      console.warn('Notification insert error:', err);
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await supabase
      .from('noir_notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('noir_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async respondToFollowRequest(followerId: string, accept: boolean): Promise<boolean> {
    const { data, error } = await supabase.rpc('respond_to_follow_request', {
      p_follower_id: followerId,
      p_accept: accept,
    });
    if (error) throw error;
    return data === true;
  },

  subscribeToNotifications(userId: string, onNotification: (notification: AppNotification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'noir_notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          if (payload.new) onNotification(mapNotification(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // -------------------------------------------------------------
  // COMMENTS (The Gazette)
  // -------------------------------------------------------------
  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('noir_post_comments')
      .select(`
        *,
        author:noir_profiles!noir_post_comments_user_id_fkey(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data.map(c => ({
      id: c.id,
      author: {
        id: c.author?.id || c.user_id,
        name: c.author?.name || 'Patron',
        username: c.author?.username || 'patron',
        avatar: c.author?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!c.author?.is_verified,
      },
      text: c.content,
      createdAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isLiked: false,
    }));
  },

  async addComment(postId: string, _userId: string, content: string): Promise<Comment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Yorum yapmak için giriş yapmalısınız.');
    const activeUserId = user.id;

    const { data, error } = await supabase
      .from('noir_post_comments')
      .insert({
        post_id: postId,
        user_id: activeUserId,
        content,
      })
      .select(`
        *,
        author:noir_profiles!noir_post_comments_user_id_fkey(*)
      `)
      .single();

    if (error || !data) {
      console.error('Error creating comment:', error);
      return null;
    }

    return {
      id: data.id,
      author: {
        id: data.author?.id || data.user_id,
        name: data.author?.name || 'Patron',
        username: data.author?.username || 'patron',
        avatar: data.author?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!data.author?.is_verified,
      },
      text: data.content,
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
    };
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // MESSAGING (Dispatches - Realtime)
  // -------------------------------------------------------------
  async getOrCreateConversation(currentUserId: string, targetUserId: string): Promise<string> {
    // Check if a conversation between these two already exists
    const { data: myConvs } = await supabase
      .from('noir_conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (myConvs && myConvs.length > 0) {
      const convIds = myConvs.map(c => c.conversation_id);
      const { data: targetConvs } = await supabase
        .from('noir_conversation_participants')
        .select('conversation_id')
        .eq('user_id', targetUserId)
        .in('conversation_id', convIds);

      if (targetConvs && targetConvs.length > 0) {
        return targetConvs[0].conversation_id;
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('noir_conversations')
      .insert({ created_by: currentUserId })
      .select()
      .single();

    if (convError || !newConv) {
      throw new Error('Failed to create conversation');
    }

    // Add participants
    await supabase.from('noir_conversation_participants').insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: targetUserId },
    ]);

    return newConv.id;
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data: participants, error } = await supabase
      .from('noir_conversation_participants')
      .select(`
        conversation_id,
        conversation:noir_conversations(
          id,
          created_at,
          participants:noir_conversation_participants(
            user:noir_profiles(*)
          )
        )
      `)
      .eq('user_id', userId);

    if (error || !participants) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const convList: Conversation[] = [];

    for (const item of participants) {
      const conv = item.conversation as any;
      if (!conv) continue;

      const otherParticipant = conv.participants?.find((p: any) => p.user?.id !== userId)?.user;
      const partnerName = otherParticipant?.name || 'Maison Salon';
      const partnerAvatar = otherParticipant?.avatar || DEFAULT_AVATAR_URL;

      // Fetch messages for this conversation
      const { data: msgs } = await supabase
        .from('noir_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      // Fetch read state for current user
      const { data: readState } = await supabase
        .from('noir_conversation_reads')
        .select('last_read_at')
        .eq('conversation_id', conv.id)
        .eq('user_id', userId)
        .maybeSingle();

      const lastReadTime = readState?.last_read_at ? new Date(readState.last_read_at).getTime() : 0;

      const unreadCount = (msgs || []).filter(m =>
        m.sender_id !== userId && new Date(m.created_at).getTime() > lastReadTime
      ).length;

      const messages: ChatMessage[] = (msgs || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        text: m.content,
        mediaUrl: m.media_url,
        createdAt: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawCreatedAt: m.created_at,
        status: (m.status as any) || 'delivered',
      }));

      const lastMsg = messages[messages.length - 1];

      convList.push({
        id: conv.id,
        participant: {
          id: otherParticipant?.id || 'partner',
          name: partnerName,
          username: otherParticipant?.username || 'member',
          avatar: partnerAvatar,
          isOnline: true,
          isVerified: !!otherParticipant?.is_verified,
          membershipTier: 'standard',
        },
        unreadCount,
        lastMessage: lastMsg?.text || 'Conversation initiated.',
        lastMessageTime: lastMsg?.createdAt || 'Recent',
        messages,
      });
    }

    return convList;
  },

  async markConversationAsRead(conversationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Call server-side atomic RPC first (ensures zero clock skew between DB now() and last_read_at)
    const { error: rpcErr } = await supabase.rpc('mark_conversation_read', { p_conv_id: conversationId });
    if (!rpcErr) {
      return true;
    }

    // Fallback direct upsert if RPC is unavailable
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('noir_conversation_reads')
      .upsert(
        {
          conversation_id: conversationId,
          user_id: user.id,
          last_read_at: now,
          updated_at: now,
        },
        { onConflict: 'conversation_id,user_id' }
      );

    if (error) {
      console.error('Error marking conversation as read:', error);
      return false;
    }
    return true;
  },

  async sendMessage(conversationId: string, _senderId: string, content: string, mediaUrl?: string): Promise<ChatMessage | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Mesaj göndermek için giriş yapmalısınız.');
    const activeSenderId = user.id;

    const { data, error } = await supabase
      .from('noir_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: activeSenderId,
        content,
        media_url: mediaUrl,
        status: 'delivered',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update conversation updated_at
    await supabase
      .from('noir_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      text: data.content,
      mediaUrl: data.media_url,
      createdAt: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
  },

  // -------------------------------------------------------------
  // REALTIME SUBSCRIPTIONS
  // -------------------------------------------------------------
  subscribeToMessages(onNewMessage: (msg: ChatMessage) => void) {
    const channel = supabase
      .channel('public:noir_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'noir_messages' },
        payload => {
          const m = payload.new as any;
          if (m) {
            onNewMessage({
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              text: m.content,
              mediaUrl: m.media_url,
              createdAt: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToPosts(onNewPost: (post: Post) => void) {
    const channel = supabase
      .channel('public:noir_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'noir_posts' },
        async payload => {
          const p = payload.new as any;
          if (p) {
            // Fetch author
            const { data: author } = await supabase
              .from('noir_profiles')
              .select('*')
              .eq('id', p.author_id)
              .single();

            onNewPost({
              id: p.id,
              author: {
                id: author?.id || p.author_id,
                name: author?.name || 'Maison Patron',
                username: author?.username || 'patron',
                avatar: author?.avatar || DEFAULT_AVATAR_URL,
                isVerified: !!author?.is_verified,
              },
              type: p.type || 'text',
              content: p.content,
              mediaUrl: p.media_url,
              likesCount: p.likes_count || 0,
              commentsCount: p.comments_count || 0,
              sharesCount: 0,
              isLiked: false,
              isSaved: false,
              createdAt: 'Just now',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // -------------------------------------------------------------
  // EVENTS & CALENDAR SUBSYSTEM (Database-Backed)
  // -------------------------------------------------------------
  async getEventCategories(): Promise<EventCategory[]> {
    const { data, error } = await supabase
      .from('noir_event_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.error('Error fetching event categories:', error);
      return [];
    }

    return data.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon || undefined,
      description: c.description || undefined,
      sortOrder: c.sort_order,
    }));
  },

  async getEvents(filters?: EventFilters, currentUserId?: string): Promise<PlatformEvent[]> {
    let query = supabase
      .from('noir_events')
      .select(`
        *,
        organizer:noir_profiles!noir_events_organizer_id_fkey(*),
        category:noir_event_categories(*),
        venue_data:noir_venues(*)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'published');
    }

    if (filters?.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.startAfter) {
      query = query.gte('start_at', filters.startAfter);
    }

    if (filters?.startBefore) {
      query = query.lte('start_at', filters.startBefore);
    }

    if (filters?.organizerId) {
      query = query.eq('organizer_id', filters.organizerId);
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},venue.ilike.${term},city.ilike.${term}`);
    }

    query = query.order('start_at', { ascending: true });

    const { data, error } = await query;

    if (error || !data) {
      console.error('Error fetching noir_events:', error);
      return [];
    }

    // Fetch user registrations and saves if currentUserId is provided
    let savedEventIds: string[] = [];
    let userAttendeeMap: Record<string, any> = {};

    if (currentUserId && currentUserId !== '00000000-0000-0000-0000-000000000000') {
      try {
        const [savesRes, attendeesRes] = await Promise.all([
          supabase.from('noir_event_saves').select('event_id').eq('user_id', currentUserId),
          supabase.from('noir_event_attendees').select('*').eq('user_id', currentUserId),
        ]);

        if (savesRes.data) {
          savedEventIds = savesRes.data.map(s => s.event_id);
        }
        if (attendeesRes.data) {
          attendeesRes.data.forEach(a => {
            userAttendeeMap[a.event_id] = a;
          });
        }
      } catch (err) {
        console.warn('Could not fetch user event state:', err);
      }
    }

    let results = data.map((evt: any) => {
      const userAtt = userAttendeeMap[evt.id];
      const isRegistered = !!userAtt && userAtt.status !== 'cancelled';
      const isCheckedIn = !!userAtt?.is_checked_in;
      const appStatus = userAtt ? userAtt.status : 'none';
      const ticketCode = userAtt?.ticket_code || undefined;
      const isNdaSigned = !!userAtt?.nda_signed;

      return {
        id: evt.id,
        organizerId: evt.organizer_id,
        seriesId: evt.series_id,
        title: evt.title,
        description: evt.description || '',
        category: evt.category?.slug || 'lifestyle',
        categoryId: evt.category_id,
        venueId: evt.venue_id,
        venueData: evt.venue_data || undefined,
        status: evt.status,
        city: evt.city || 'Amsterdam',
        venue: evt.venue || '',
        address: evt.address || '',
        latitude: evt.latitude,
        longitude: evt.longitude,
        coverImage: evt.cover_image || DEFAULT_COVER_URL,
        capacity: evt.capacity || 50,
        attendeesCount: evt.attendees_count || 0,
        savesCount: evt.saves_count || 0,
        viewsCount: evt.views_count || 0,
        price: Number(evt.price) || 0,
        currency: evt.currency || 'EUR',
        vipFree: !!evt.vip_free,
        requiresApproval: !!evt.requires_approval,
        ndaRequired: !!evt.nda_required,
        dressCode: evt.dress_code || undefined,
        participationTarget: evt.participation_target || 'all',
        orientationNotice: evt.orientation_notice || undefined,
        minAge: evt.min_age || 21,
        isPrivate: !!evt.is_private,
        startsAt: evt.start_at,
        endsAt: evt.end_at || evt.start_at,
        timezone: evt.timezone || 'Europe/Amsterdam',
        isUserRegistered: isRegistered,
        isCheckedIn,
        isSaved: savedEventIds.includes(evt.id),
        applicationStatus: appStatus,
        ticketCode,
        isNdaSigned,
        organizer: {
          id: evt.organizer?.id || evt.organizer_id,
          name: evt.organizer?.name || 'Maison Salon',
          username: evt.organizer?.username || 'salon',
          avatar: evt.organizer?.avatar || DEFAULT_AVATAR_URL,
          isVerified: !!evt.organizer?.is_verified,
        },
        createdAt: evt.created_at,
        updatedAt: evt.updated_at,
      } as PlatformEvent;
    });

    if (filters?.savedOnly) {
      results = results.filter(e => e.isSaved);
    }

    if (filters?.registeredOnly) {
      results = results.filter(e => e.isUserRegistered);
    }

    return results;
  },

  async getEvent(eventId: string, currentUserId?: string): Promise<PlatformEvent | null> {
    const { data: evt, error } = await supabase
      .from('noir_events')
      .select(`
        *,
        organizer:noir_profiles!noir_events_organizer_id_fkey(*),
        category:noir_event_categories(*),
        venue_data:noir_venues(*)
      `)
      .eq('id', eventId)
      .single();

    if (error || !evt) {
      console.error('Error fetching event detail:', error);
      return null;
    }

    let isSaved = false;
    let userAtt: any = null;
    let attendeeAvatars: string[] = [];

    try {
      // 1. Check user state
      if (currentUserId && currentUserId !== '00000000-0000-0000-0000-000000000000') {
        const [saveRes, attRes] = await Promise.all([
          supabase.from('noir_event_saves').select('id').eq('event_id', eventId).eq('user_id', currentUserId).maybeSingle(),
          supabase.from('noir_event_attendees').select('*').eq('event_id', eventId).eq('user_id', currentUserId).maybeSingle(),
        ]);
        isSaved = !!saveRes.data;
        userAtt = attRes.data;
      }

      // 2. Fetch recent approved attendee avatars
      const { data: attList } = await supabase
        .from('noir_event_attendees')
        .select('user:noir_profiles!noir_event_attendees_user_id_fkey(avatar)')
        .eq('event_id', eventId)
        .eq('status', 'approved')
        .limit(8);

      if (attList) {
        attendeeAvatars = attList.map((a: any) => a.user?.avatar).filter(Boolean);
      }
    } catch (err) {
      console.warn('Could not fetch extra event details:', err);
    }

    return {
      id: evt.id,
      organizerId: evt.organizer_id,
      seriesId: evt.series_id,
      title: evt.title,
      description: evt.description || '',
      category: evt.category?.slug || 'lifestyle',
      categoryId: evt.category_id,
      venueId: evt.venue_id,
      venueData: evt.venue_data || undefined,
      status: evt.status,
      city: evt.city || 'Amsterdam',
      venue: evt.venue || '',
      address: evt.address || '',
      latitude: evt.latitude,
      longitude: evt.longitude,
      coverImage: evt.cover_image || DEFAULT_COVER_URL,
      capacity: evt.capacity || 50,
      attendeesCount: evt.attendees_count || 0,
      savesCount: evt.saves_count || 0,
      viewsCount: evt.views_count || 0,
      price: Number(evt.price) || 0,
      currency: evt.currency || 'EUR',
      vipFree: !!evt.vip_free,
      requiresApproval: !!evt.requires_approval,
      ndaRequired: !!evt.nda_required,
      dressCode: evt.dress_code || undefined,
      participationTarget: evt.participation_target || 'all',
      orientationNotice: evt.orientation_notice || undefined,
      minAge: evt.min_age || 21,
      isPrivate: !!evt.is_private,
      startsAt: evt.start_at,
      endsAt: evt.end_at || evt.start_at,
      timezone: evt.timezone || 'Europe/Amsterdam',
      isUserRegistered: !!userAtt && userAtt.status !== 'cancelled',
      isCheckedIn: !!userAtt?.is_checked_in,
      isSaved,
      applicationStatus: userAtt ? userAtt.status : 'none',
      ticketCode: userAtt?.ticket_code || undefined,
      isNdaSigned: !!userAtt?.nda_signed,
      organizer: {
        id: evt.organizer?.id || evt.organizer_id,
        name: evt.organizer?.name || 'Maison Salon',
        username: evt.organizer?.username || 'salon',
        avatar: evt.organizer?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!evt.organizer?.is_verified,
      },
      attendeeAvatars,
      createdAt: evt.created_at,
      updatedAt: evt.updated_at,
    };
  },

  async createEvent(payload: CreateEventPayload): Promise<PlatformEvent | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Etkinlik oluşturmak için giriş yapmalısınız.');

    // Check organizer status for quality governance
    const { data: profile } = await supabase
      .from('noir_profiles')
      .select('is_organizer, is_admin')
      .eq('id', user.id)
      .single();

    const isVerifiedHost = !!profile?.is_organizer || !!profile?.is_admin;
    // Non-verified hosts default to pending_review for admin curation
    const initialStatus = isVerifiedHost ? (payload.status || 'published') : 'pending_review';

    const insertData: Record<string, any> = {
      organizer_id: user.id,
      venue_id: payload.venueId || null,
      title: payload.title,
      description: payload.description || '',
      cover_image: payload.coverImage || DEFAULT_COVER_URL,
      category_id: payload.categoryId || null,
      status: initialStatus,
      start_at: payload.startAt,
      end_at: payload.endAt || null,
      timezone: payload.timezone || 'Europe/Amsterdam',
      city: payload.city || 'Amsterdam',
      venue: payload.venue || '',
      address: payload.address || '',
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      capacity: payload.capacity || null,
      price: payload.price ?? 0,
      currency: payload.currency || 'EUR',
      vip_free: payload.vipFree ?? false,
      requires_approval: payload.requiresApproval ?? true,
      nda_required: payload.ndaRequired ?? false,
      dress_code: payload.dressCode || null,
      participation_target: payload.participationTarget || 'all',
      orientation_notice: payload.orientationNotice || null,
      min_age: payload.minAge || 21,
      is_private: payload.isPrivate ?? false,
    };

    const { data, error } = await supabase
      .from('noir_events')
      .insert(insertData)
      .select(`
        *,
        organizer:noir_profiles!noir_events_organizer_id_fkey(*),
        category:noir_event_categories(*)
      `)
      .single();

    if (error || !data) {
      console.error('Error creating event:', error);
      return null;
    }

    return {
      id: data.id,
      organizerId: data.organizer_id,
      seriesId: data.series_id,
      title: data.title,
      description: data.description || '',
      category: data.category?.slug || 'lifestyle',
      categoryId: data.category_id,
      status: data.status,
      city: data.city || 'Amsterdam',
      venue: data.venue || '',
      address: data.address || '',
      latitude: data.latitude,
      longitude: data.longitude,
      coverImage: data.cover_image || DEFAULT_COVER_URL,
      capacity: data.capacity || 50,
      attendeesCount: 0,
      savesCount: 0,
      viewsCount: 0,
      price: Number(data.price) || 0,
      currency: data.currency || 'EUR',
      vipFree: !!data.vip_free,
      requiresApproval: !!data.requires_approval,
      ndaRequired: !!data.nda_required,
      dressCode: data.dress_code || undefined,
      participationTarget: data.participation_target || 'all',
      orientationNotice: data.orientation_notice || undefined,
      minAge: data.min_age || 21,
      isPrivate: !!data.is_private,
      startsAt: data.start_at,
      endsAt: data.end_at || data.start_at,
      timezone: data.timezone || 'Europe/Amsterdam',
      isUserRegistered: false,
      isCheckedIn: false,
      isSaved: false,
      applicationStatus: 'none',
      organizer: {
        id: data.organizer?.id || data.organizer_id,
        name: data.organizer?.name || 'Maison Salon',
        username: data.organizer?.username || 'salon',
        avatar: data.organizer?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!data.organizer?.is_verified,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateEvent(eventId: string, updates: Partial<CreateEventPayload>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Yetkisiz işlem.');

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.coverImage !== undefined) patch.cover_image = updates.coverImage;
    if (updates.categoryId !== undefined) patch.category_id = updates.categoryId;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.startAt !== undefined) patch.start_at = updates.startAt;
    if (updates.endAt !== undefined) patch.end_at = updates.endAt;
    if (updates.timezone !== undefined) patch.timezone = updates.timezone;
    if (updates.city !== undefined) patch.city = updates.city;
    if (updates.venue !== undefined) patch.venue = updates.venue;
    if (updates.address !== undefined) patch.address = updates.address;
    if (updates.latitude !== undefined) patch.latitude = updates.latitude;
    if (updates.longitude !== undefined) patch.longitude = updates.longitude;
    if (updates.capacity !== undefined) patch.capacity = updates.capacity;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.currency !== undefined) patch.currency = updates.currency;
    if (updates.vipFree !== undefined) patch.vip_free = updates.vipFree;
    if (updates.requiresApproval !== undefined) patch.requires_approval = updates.requiresApproval;
    if (updates.ndaRequired !== undefined) patch.nda_required = updates.ndaRequired;
    if (updates.dressCode !== undefined) patch.dress_code = updates.dressCode;
    if (updates.participationTarget !== undefined) patch.participation_target = updates.participationTarget;
    if (updates.orientationNotice !== undefined) patch.orientation_notice = updates.orientationNotice;
    if (updates.minAge !== undefined) patch.min_age = updates.minAge;
    if (updates.isPrivate !== undefined) patch.is_private = updates.isPrivate;

    const { error } = await supabase
      .from('noir_events')
      .update(patch)
      .eq('id', eventId)
      .eq('organizer_id', user.id);

    if (error) {
      console.error('Error updating event:', error);
      return false;
    }
    return true;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_events')
      .delete()
      .eq('id', eventId)
      .eq('organizer_id', user.id);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }
    return true;
  },

  async getCalendarEvents(startDate: string, endDate: string, currentUserId?: string): Promise<PlatformEvent[]> {
    return this.getEvents({
      startAfter: startDate,
      startBefore: endDate,
      status: 'published',
    }, currentUserId);
  },

  // -------------------------------------------------------------
  // REGISTRATIONS & ATTENDEES
  // -------------------------------------------------------------
  async registerForEvent(eventId: string, payload: RegistrationPayload): Promise<EventAttendee | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Etkinliğe başvurmak için giriş yapmalısınız.');

    // 1. Fetch event to check approval requirement and organizer
    const { data: eventData, error: eventErr } = await supabase
      .from('noir_events')
      .select('id, title, organizer_id, requires_approval, capacity, attendees_count')
      .eq('id', eventId)
      .single();

    if (eventErr || !eventData) {
      throw new Error('Etkinlik bulunamadı.');
    }

    const initialStatus = eventData.requires_approval ? 'pending' : 'approved';

    // 2. Upsert attendee record
    const { data, error } = await supabase
      .from('noir_event_attendees')
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status: initialStatus,
          participation_type: payload.participationType || 'all',
          note: payload.note || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'event_id,user_id' }
      )
      .select(`
        *,
        user:noir_profiles!noir_event_attendees_user_id_fkey(*)
      `)
      .single();

    if (error || !data) {
      console.error('Error registering for event:', error);
      return null;
    }

    // 3. Notify the event organizer of the new registration
    try {
      await this.createNotification({
        userId: eventData.organizer_id,
        actorId: user.id,
        type: 'event_registration',
        title: 'Yeni Etkinlik Başvurusu 🎟️',
        content: `"${eventData.title}" etkinliğinize yeni bir katılım başvurusu yapıldı.`,
      });
    } catch (notifErr) {
      console.warn('Failed to send registration notification:', notifErr);
    }

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      userName: data.user?.name || 'Patron',
      userUsername: data.user?.username || 'member',
      userAvatar: data.user?.avatar || DEFAULT_AVATAR_URL,
      isVerified: !!data.user?.is_verified,
      status: data.status,
      participationType: data.participation_type,
      note: data.note,
      ticketCode: data.ticket_code,
      isPaid: !!data.is_paid,
      isCheckedIn: !!data.is_checked_in,
      checkedInAt: data.checked_in_at,
      ndaSigned: !!data.nda_signed,
      ndaSignedAt: data.nda_signed_at,
      createdAt: data.created_at,
    };
  },

  async cancelRegistration(eventId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }
    return true;
  },

  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    const { data, error } = await supabase
      .from('noir_event_attendees')
      .select(`
        *,
        user:noir_profiles!noir_event_attendees_user_id_fkey(*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching attendees:', error);
      return [];
    }

    return data.map(a => ({
      id: a.id,
      eventId: a.event_id,
      userId: a.user_id,
      userName: a.user?.name || 'Patron',
      userUsername: a.user?.username || 'member',
      userAvatar: a.user?.avatar || DEFAULT_AVATAR_URL,
      isVerified: !!a.user?.is_verified,
      status: a.status,
      participationType: a.participation_type,
      note: a.note,
      ticketCode: a.ticket_code,
      isPaid: !!a.is_paid,
      isCheckedIn: !!a.is_checked_in,
      checkedInAt: a.checked_in_at,
      ndaSigned: !!a.nda_signed,
      ndaSignedAt: a.nda_signed_at,
      createdAt: a.created_at,
    }));
  },

  async approveRegistration(attendeeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('noir_event_attendees')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendeeId)
      .select('user_id, event:noir_events(title)')
      .single();

    if (error || !data) {
      console.error('Error approving registration:', error);
      return false;
    }

    // Send notification to the approved user
    try {
      const eventTitle = (data.event as any)?.title || 'Etkinlik';
      await this.createNotification({
        userId: data.user_id,
        type: 'event_approval',
        title: 'Başvurunuz Onaylandı! ✨',
        content: `"${eventTitle}" salon davetiniz onaylandı. Giriş kartınızı (QR) görüntüleyebilirsiniz.`,
      });
    } catch (notifErr) {
      console.warn('Could not send approval notification:', notifErr);
    }

    return true;
  },

  async rejectRegistration(attendeeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('noir_event_attendees')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendeeId)
      .select('user_id, event:noir_events(title)')
      .single();

    if (error || !data) {
      console.error('Error rejecting registration:', error);
      return false;
    }

    try {
      const eventTitle = (data.event as any)?.title || 'Etkinlik';
      await this.createNotification({
        userId: data.user_id,
        type: 'event_rejection',
        title: 'Başvuru Durumu Bildirimi',
        content: `"${eventTitle}" salonu için kontenjan/profil gereksinimleri nedeniyle bu buluşmada yer açılamadı.`,
      });
    } catch (notifErr) {
      console.warn('Could not send rejection notification:', notifErr);
    }

    return true;
  },

  async checkInAttendee(attendeeOrEventId: string, userId?: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = userId || user?.id;

    let updateQuery = supabase
      .from('noir_event_attendees')
      .update({
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (effectiveUserId) {
      updateQuery = updateQuery.or(`id.eq.${attendeeOrEventId},and(event_id.eq.${attendeeOrEventId},user_id.eq.${effectiveUserId})`);
    } else {
      updateQuery = updateQuery.eq('id', attendeeOrEventId);
    }

    const { error } = await updateQuery;
    if (error) {
      console.error('Error checking in attendee:', error);
      return false;
    }
    return true;
  },

  async signEventNda(eventId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_event_attendees')
      .update({
        nda_signed: true,
        nda_signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error signing NDA:', error);
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // SAVES / BOOKMARKS (Events)
  // -------------------------------------------------------------
  async toggleSaveEvent(eventId: string, currentlySaved: boolean): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Etkinliği kaydetmek için giriş yapmalısınız.');
    const activeUserId = user.id;

    if (currentlySaved) {
      const { error } = await supabase
        .from('noir_event_saves')
        .delete()
        .match({ user_id: activeUserId, event_id: eventId });
      return error ? true : false;
    } else {
      const { error } = await supabase
        .from('noir_event_saves')
        .upsert(
          { user_id: activeUserId, event_id: eventId },
          { onConflict: 'event_id,user_id', ignoreDuplicates: true }
        );
      return error ? false : true;
    }
  },

  async getSavedEventIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_event_saves')
      .select('event_id')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map(r => r.event_id);
  },

  // -------------------------------------------------------------
  // EVENT COMMENTS
  // -------------------------------------------------------------
  async getEventComments(eventId: string): Promise<EventComment[]> {
    const { data, error } = await supabase
      .from('noir_event_comments')
      .select(`
        *,
        user:noir_profiles!noir_event_comments_user_id_fkey(*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching event comments:', error);
      return [];
    }

    return data.map(c => ({
      id: c.id,
      eventId: c.event_id,
      user: {
        id: c.user?.id || c.user_id,
        name: c.user?.name || 'Patron',
        username: c.user?.username || 'member',
        avatar: c.user?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!c.user?.is_verified,
      },
      content: c.content,
      createdAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  },

  async addEventComment(eventId: string, content: string): Promise<EventComment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Yorum yapmak için giriş yapmalısınız.');

    const { data, error } = await supabase
      .from('noir_event_comments')
      .insert({
        event_id: eventId,
        user_id: user.id,
        content,
      })
      .select(`
        *,
        user:noir_profiles!noir_event_comments_user_id_fkey(*)
      `)
      .single();

    if (error || !data) {
      console.error('Error creating event comment:', error);
      return null;
    }

    return {
      id: data.id,
      eventId: data.event_id,
      user: {
        id: data.user?.id || data.user_id,
        name: data.user?.name || 'Patron',
        username: data.user?.username || 'member',
        avatar: data.user?.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!data.user?.is_verified,
      },
      content: data.content,
      createdAt: 'Just now',
    };
  },

  async deleteEventComment(commentId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('noir_event_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting event comment:', error);
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // EVENT VIEWS & ANALYTICS
  // -------------------------------------------------------------
  async trackEventView(eventId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('noir_event_views')
        .insert({
          event_id: eventId,
          user_id: user?.id || null,
        });
    } catch {
      // Non-critical tracking
    }
  },

  // -------------------------------------------------------------
  // BOUTIQUE VENUES & ESTATES DIRECTORY
  // -------------------------------------------------------------
  async getVenues(filters?: { city?: string; type?: string; verifiedOnly?: boolean }): Promise<Venue[]> {
    let query = supabase
      .from('noir_venues')
      .select('*')
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('venue_type', filters.type);
    }
    if (filters?.verifiedOnly) {
      query = query.eq('is_verified', true);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error('Error fetching venues:', error);
      return [];
    }

    return data.map((v: any) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      description: v.description || '',
      city: v.city,
      address: v.address || '',
      venueType: v.venue_type,
      capacity: v.capacity,
      coverImage: v.cover_image || DEFAULT_COVER_URL,
      photos: v.photos || [],
      amenities: v.amenities || [],
      rules: v.rules || [],
      isVerified: !!v.is_verified,
      ownerId: v.owner_id,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }));
  },

  async getVenue(venueId: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from('noir_venues')
      .select('*')
      .eq('id', venueId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      city: data.city,
      address: data.address || '',
      venueType: data.venue_type,
      capacity: data.capacity,
      coverImage: data.cover_image || DEFAULT_COVER_URL,
      photos: data.photos || [],
      amenities: data.amenities || [],
      rules: data.rules || [],
      isVerified: !!data.is_verified,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async createVenue(payload: Partial<Venue>): Promise<Venue | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Mekan eklemek için giriş yapmalısınız.');

    const slug = (payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')) || `venue-${Date.now()}`;

    const { data, error } = await supabase
      .from('noir_venues')
      .insert({
        name: payload.name,
        slug,
        description: payload.description || '',
        city: payload.city || 'Amsterdam',
        address: payload.address || '',
        venue_type: payload.venueType || 'villa',
        capacity: payload.capacity || 50,
        cover_image: payload.coverImage || DEFAULT_COVER_URL,
        photos: payload.photos || [],
        amenities: payload.amenities || [],
        rules: payload.rules || [],
        is_verified: false,
        owner_id: user.id,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating venue:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      city: data.city,
      address: data.address,
      venueType: data.venue_type,
      capacity: data.capacity,
      coverImage: data.cover_image,
      photos: data.photos,
      amenities: data.amenities,
      rules: data.rules,
      isVerified: data.is_verified,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // -------------------------------------------------------------
  // ORGANIZER APPLICATIONS (Host Onboarding)
  // -------------------------------------------------------------
  async applyForOrganizer(data: { experience: string; intendedEvents: string; socialLinks?: string }): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Başvuru için giriş yapmalısınız.');

    const { error } = await supabase
      .from('noir_organizer_applications')
      .upsert(
        {
          user_id: user.id,
          experience: data.experience,
          intended_events: data.intendedEvents,
          social_links: data.socialLinks || null,
          status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error submitting organizer application:', error);
      return false;
    }

    // Update profile status to pending
    await supabase
      .from('noir_profiles')
      .update({ organizer_status: 'pending' })
      .eq('id', user.id);

    return true;
  },

  async getOrganizerApplication(userId: string): Promise<OrganizerApplication | null> {
    const { data, error } = await supabase
      .from('noir_organizer_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      experience: data.experience,
      intendedEvents: data.intended_events,
      socialLinks: data.social_links,
      status: data.status,
      reviewerNotes: data.reviewer_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // -------------------------------------------------------------
  // ADMIN GOVERNANCE (Events, Venues, Host Curation)
  // -------------------------------------------------------------
  async getPendingEvents(): Promise<PlatformEvent[]> {
    return this.getEvents({ status: 'pending_review' as any });
  },

  async approveEvent(eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('noir_events')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select('title, organizer_id')
      .single();

    if (error || !data) {
      console.error('Error approving event:', error);
      return false;
    }

    // Notify organizer
    try {
      await this.createNotification({
        userId: data.organizer_id,
        type: 'event_approval',
        title: 'Etkinliğiniz Onaylandı ve Yayınlandı! ✨',
        content: `"${data.title}" etkinliği salon küratörleri tarafından incelendi ve takvimde yayına alındı.`,
      });
    } catch {
      // Non-critical
    }

    return true;
  },

  async rejectEvent(eventId: string, reason?: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('noir_events')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select('title, organizer_id')
      .single();

    if (error || !data) {
      console.error('Error rejecting event:', error);
      return false;
    }

    try {
      await this.createNotification({
        userId: data.organizer_id,
        type: 'event_rejection',
        title: 'Etkinlik Başvurusu Bildirimi',
        content: `"${data.title}" salon etkinliği platform kuralları gereğince onaylanamadı. Sebep: ${reason || 'Kürasyon standartları'}`,
      });
    } catch {
      // Non-critical
    }

    return true;
  },

  async getOrganizerApplications(): Promise<OrganizerApplication[]> {
    const { data, error } = await supabase
      .from('noir_organizer_applications')
      .select(`
        *,
        user:noir_profiles!noir_organizer_applications_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching organizer applications:', error);
      return [];
    }

    return data.map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      user: a.user ? {
        id: a.user.id,
        name: a.user.name,
        username: a.user.username,
        avatar: a.user.avatar || DEFAULT_AVATAR_URL,
        isVerified: !!a.user.is_verified,
        membershipTier: a.user.membership_tier,
      } : undefined,
      experience: a.experience,
      intendedEvents: a.intended_events,
      socialLinks: a.social_links,
      status: a.status,
      reviewerNotes: a.reviewer_notes,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
  },

  async reviewOrganizerApplication(applicationId: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> {
    const { data: appData, error: appErr } = await supabase
      .from('noir_organizer_applications')
      .update({
        status,
        reviewer_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select('user_id')
      .single();

    if (appErr || !appData) {
      console.error('Error reviewing organizer application:', appErr);
      return false;
    }

    // Update profile role
    await supabase
      .from('noir_profiles')
      .update({
        is_organizer: status === 'approved',
        organizer_status: status === 'approved' ? 'verified' : 'rejected',
      })
      .eq('id', appData.user_id);

    // Notify user
    try {
      await this.createNotification({
        userId: appData.user_id,
        type: 'system',
        title: status === 'approved' ? 'Tebrikler! Organizatör Statünüz Onaylandı 👑' : 'Organizatör Başvurusu Durumu',
        content: status === 'approved'
          ? 'Artık Major Club üzerinde özel salonlar ve etkinlikler oluşturabilir, davetli listelerini yönetebilirsiniz.'
          : `Organizatör başvurunuz incelendi ancak şu an için onaylanamadı. Not: ${notes || 'Standart kriterler'}`,
      });
    } catch {
      // Non-critical
    }

    return true;
  },
};
