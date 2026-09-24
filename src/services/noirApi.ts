import { supabase } from '../lib/supabase';
import { UserProfile, Post, Comment, Conversation, ChatMessage, AppNotification } from '../types';

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
      avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      bio: item.bio || '',
      location: item.location || 'Amsterdam',
      website: '',
      joinDate: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isVerified: !!item.is_verified,
      followersCount: 120,
      followingCount: 84,
      postsCount: 12,
      totalLikes: 340,
      subscriptionPrice: 0,
      membershipTier: 'standard',
      isSubscribed: false,
      isFollowing: false,
      age: item.age || 28,
      gender: item.gender || 'all',
      orientation: item.orientation || 'Straight',
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

    const { error } = await supabase
      .from('noir_profiles')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    return true;
  },

  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
    const payload = {
      id: profile.id,
      name: profile.name || 'Anonymous Patron',
      username: profile.username || `patron_${profile.id.slice(0, 6)}`,
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: profile.bio || 'Curated member of Maison Noir.',
      location: profile.location || 'Amsterdam Centrum',
      age: profile.age || 29,
      gender: profile.gender || 'female',
      orientation: profile.orientation || 'Straight',
      is_verified: true,
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
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      bio: data.bio,
      location: data.location,
      website: '',
      joinDate: 'Recent',
      isVerified: data.is_verified,
      followersCount: 45,
      followingCount: 30,
      postsCount: 1,
      totalLikes: 10,
      subscriptionPrice: 0,
      membershipTier: 'standard',
      isSubscribed: false,
      isFollowing: false,
      age: data.age,
      gender: data.gender,
      orientation: data.orientation,
    };
  },

  // -------------------------------------------------------------
  // POSTS (The Gazette)
  // -------------------------------------------------------------
  async getPosts(currentUserId?: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('noir_posts')
      .select(`
        *,
        author:noir_profiles!noir_posts_author_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

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
        avatar: p.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
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
      createdAt: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  },

  async createPost(post: { authorId: string; content: string; type?: string; mediaUrl?: string }): Promise<Post | null> {
    const { data, error } = await supabase
      .from('noir_posts')
      .insert({
        author_id: post.authorId,
        content: post.content,
        type: post.type || (post.mediaUrl ? 'photo' : 'text'),
        media_url: post.mediaUrl,
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
        avatar: data.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
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
      createdAt: 'Just now',
    };
  },

  // -------------------------------------------------------------
  // STORAGE & MEDIA UPLOADS
  // -------------------------------------------------------------
  async uploadImage(file: File, folder: string = 'media'): Promise<string | null> {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext.toLowerCase()) ? ext.toLowerCase() : 'jpg';
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

      const { data, error } = await supabase.storage
        .from('noir-media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
        });

      if (error || !data) {
        console.error('Storage upload error:', error);
        return null;
      }

      const { data: pubData } = supabase.storage.from('noir-media').getPublicUrl(data.path);
      return pubData.publicUrl;
    } catch (err) {
      console.error('Upload exception:', err);
      return null;
    }
  },

  // -------------------------------------------------------------
  // LIKES (The Gazette)
  // -------------------------------------------------------------
  async toggleLikePost(postId: string, userId: string, currentlyLiked: boolean): Promise<number> {
    if (currentlyLiked) {
      await supabase
        .from('noir_post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId });
      
      const { data } = await supabase.rpc('decrement_likes', { post_id_input: postId });
      return typeof data === 'number' ? data : 0;
    } else {
      await supabase
        .from('noir_post_likes')
        .insert({ post_id: postId, user_id: userId });

      const { data } = await supabase.rpc('increment_likes', { post_id_input: postId });
      return typeof data === 'number' ? data : 1;
    }
  },

  async getLikedPostIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_post_likes')
      .select('post_id')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map(r => r.post_id);
  },

  // -------------------------------------------------------------
  // SAVES / BOOKMARKS (The Gazette)
  // -------------------------------------------------------------
  async toggleSavePost(userId: string, postId: string, currentlySaved: boolean): Promise<boolean> {
    if (currentlySaved) {
      const { error } = await supabase
        .from('noir_post_saves')
        .delete()
        .match({ user_id: userId, post_id: postId });
      return error ? true : false;
    } else {
      const { error } = await supabase
        .from('noir_post_saves')
        .insert({ user_id: userId, post_id: postId });
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

  // -------------------------------------------------------------
  // FOLLOW SYSTEM (The Registry / Network)
  // -------------------------------------------------------------
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('noir_follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return !error;
  },

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('noir_follows')
      .delete()
      .match({ follower_id: followerId, following_id: followingId });
    return !error;
  },

  async getFollowingIds(followerId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('noir_follows')
      .select('following_id')
      .eq('follower_id', followerId);
    if (error || !data) return [];
    return data.map(r => r.following_id);
  },

  async getFollowersCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('noir_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
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

    if (error || !data) return [];
    return data.map(n => ({
      id: n.id,
      type: n.type || 'system',
      title: n.title,
      message: n.content || '',
      isRead: n.is_read,
      createdAt: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  },

  async createNotification(params: {
    userId: string;
    actorId?: string;
    type: string;
    title: string;
    content?: string;
  }): Promise<void> {
    try {
      await supabase.from('noir_notifications').insert({
        user_id: params.userId,
        actor_id: params.actorId || null,
        type: params.type,
        title: params.title,
        content: params.content || '',
        is_read: false,
      });
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
        avatar: c.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: !!c.author?.is_verified,
      },
      text: c.content,
      createdAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isLiked: false,
    }));
  },

  async addComment(postId: string, userId: string, content: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('noir_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
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

    // Safely execute increment_comments RPC in PostgreSQL
    try {
      await supabase.rpc('increment_comments', { post_id_input: postId });
    } catch (rpcErr) {
      console.warn('RPC increment_comments note:', rpcErr);
    }

    return {
      id: data.id,
      author: {
        id: data.author?.id || data.user_id,
        name: data.author?.name || 'Patron',
        username: data.author?.username || 'patron',
        avatar: data.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: !!data.author?.is_verified,
      },
      text: data.content,
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
    };
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
      .insert({})
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
      const partnerAvatar = otherParticipant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

      // Fetch messages for this conversation
      const { data: msgs } = await supabase
        .from('noir_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      const messages: ChatMessage[] = (msgs || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        text: m.content,
        mediaUrl: m.media_url,
        createdAt: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        unreadCount: 0,
        lastMessage: lastMsg?.text || 'Conversation initiated.',
        lastMessageTime: lastMsg?.createdAt || 'Recent',
        messages,
      });
    }

    return convList;
  },

  async sendMessage(conversationId: string, senderId: string, content: string, mediaUrl?: string): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('noir_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
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
                avatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
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
};
