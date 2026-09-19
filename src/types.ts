export type PostType = 'photo' | 'video' | 'text' | 'subscription' | 'ppv';

export type MembershipTier = 'standard' | 'gold' | 'vip';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  totalLikes: number;
  subscriptionPrice: number; // e.g. 99 TL/month
  membershipTier: MembershipTier;
  isSubscribed: boolean;
  isFollowing: boolean;
  age?: number;
  gender?: string;
  orientation?: string;
  dualVerifiedCouple?: boolean;
  partnerName?: string;
  partnerUsername?: string;
  hasPrivateVault?: boolean;
  vaultKeysGrantedTo?: string[];
  travelPassport?: {
    city?: string;
    country?: string;
    destinationCity?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    intent?: string;
    note?: string;
    isActive?: boolean;
  };
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  type: PostType;
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: string;
  previewBlurUrl?: string;
  tags?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  // Subscription & PPV features
  isSubscribersOnly?: boolean;
  isPPV?: boolean;
  isSensitive?: boolean;
  unlockPrice?: number; // e.g. 150 TL
  isUnlocked?: boolean;
  hasFaceMask?: boolean;
  exclusivePerks?: string[];
  comments?: Comment[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'subscription' | 'unlock' | 'follow' | 'event' | 'message';
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  time: string;
  read: boolean;
  targetId?: string;
}

// -------------------------------------------------------------
// CHAT & MESSAGING MODELS
// -------------------------------------------------------------
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'seen';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  audioDuration?: string;
  isAudio?: boolean;
  audioBlobUrl?: string;
  audioWaveform?: number[];
  status: MessageDeliveryStatus;
  createdAt: string;
  isViewOnce?: boolean;
  isViewedOnce?: boolean;
  viewOnceTimer?: number;
}

export interface Conversation {
  id: string;
  isGroup?: boolean;
  groupTitle?: string;
  groupParticipants?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    role?: string;
  }[];
  participant: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
    isVerified?: boolean;
    membershipTier?: MembershipTier;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isTyping?: boolean;
  messages: ChatMessage[];
}

// -------------------------------------------------------------
// EVENTS & TICKETING MODELS
// -------------------------------------------------------------
export interface EventAttendeeRatio {
  couples: number;
  singleWomen: number;
  singleMen: number;
  trios: number;
  singleMenQuotaFull?: boolean;
}

export interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  category: 'party' | 'arts' | 'networking' | 'lifestyle' | 'outdoor' | 'swinger' | 'trio' | 'sexparty' | 'kink' | 'cocktail' | 'dinner' | string;
  city: string;
  venue: string;
  address: string;
  coverImage: string;
  capacity: number;
  attendeesCount: number;
  price: number; // 0 for free, or 150 TL, 250 TL
  vipFree: boolean; // free for VIP members
  startsAt: string;
  endsAt: string;
  dressCode?: string;
  isUserRegistered: boolean;
  isCheckedIn: boolean;
  applicationStatus?: 'none' | 'pending' | 'approved' | 'approved_unpaid' | 'paid' | 'rejected' | 'checked_in';
  participationTarget?: 'couples_only' | 'trio_couples' | 'mixed' | 'all';
  orientationNotice?: string;
  isNetherlandsHosted?: boolean;
  ticketCode?: string;
  isNdaSigned?: boolean;
  ndaRequired?: boolean;
  attendeeRatio?: EventAttendeeRatio;
  organizer: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  attendeeAvatars?: string[];
}

// -------------------------------------------------------------
// FORUM & COMMUNITY MODELS
// -------------------------------------------------------------
export interface ForumReply {
  id: string;
  topicId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    membershipTier?: MembershipTier;
  };
  content: string;
  createdAt: string;
  upvotes: number;
  isUpvoted?: boolean;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    membershipTier?: MembershipTier;
  };
  tags: string[];
  createdAt: string;
  upvotes: number;
  downvotes: number;
  repliesCount: number;
  viewsCount: number;
  isUpvoted?: boolean;
  isPinned?: boolean;
  replies: ForumReply[];
}

export interface ForumCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  topicsCount: number;
  color: string;
}

// -------------------------------------------------------------
// DISCOVERY & MATCHING MODELS
// -------------------------------------------------------------
export interface DiscoveryProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  age: number;
  gender: 'man' | 'woman' | 'couple_mf' | 'non_binary';
  city: string;
  distanceKm: number;
  isOnline: boolean;
  isVerified: boolean;
  membershipTier: MembershipTier;
  interests: string[];
  matchRate: number; // percentage e.g. 94%
}

// -------------------------------------------------------------
// MODERATION, SAFETY & ADMIN MODELS
// -------------------------------------------------------------
export interface ReportItem {
  id: string;
  reporterName: string;
  targetType: 'user' | 'post' | 'message' | 'event';
  targetTitle: string;
  targetId: string;
  reason: string;
  description: string;
  aiRiskScore: number; // 0 - 100
  aiFlagReason: string;
  status: 'pending' | 'action_taken' | 'dismissed';
  createdAt: string;
}

// -------------------------------------------------------------
// STORIES (24H EPHEMERAL MEDIA)
// -------------------------------------------------------------
export interface Story {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    membershipTier?: MembershipTier;
  };
  mediaUrl: string;
  type: 'photo' | 'video';
  caption?: string;
  createdAt: string;
  isViewed?: boolean;
}

// -------------------------------------------------------------
// KYC & IDENTITY VERIFICATION
// -------------------------------------------------------------
export type KYCStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface KYCData {
  status: KYCStatus;
  gesturePrompt: string; // e.g. "İki parmağınızla zafer işareti yaparak selfie çekin"
  selfieUrl?: string;
  submittedAt?: string;
  aiConfidenceScore?: number; // e.g. 98.4
}

// -------------------------------------------------------------
// PROFILE VISITORS & GHOST MODE
// -------------------------------------------------------------
export interface ProfileVisitor {
  id: string;
  visitor: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    city: string;
    isVerified?: boolean;
    membershipTier?: MembershipTier;
  };
  visitedAt: string;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export interface AppNotification {
  id: string;
  type: 'ppv_unlock' | 'event_reminder' | 'event_approval' | 'chat_message' | 'forum_reply' | 'kyc' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// CLUBS & SPECIAL INTEREST COMMUNITIES
// -------------------------------------------------------------
export interface ClubCommunity {
  id: string;
  name: string;
  category: string;
  description: string;
  coverImage: string;
  membersCount: number;
  isJoined: boolean;
  isPrivate: boolean;
  recentActivity: string;
}

// -------------------------------------------------------------
// CREATOR EARNINGS & PAYOUTS
// -------------------------------------------------------------
export interface PayoutRecord {
  id: string;
  amount: number;
  netAmount: number;
  platformFee: number;
  iban: string;
  bankName: string;
  accountHolder: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}

export * from './types/anlatiTypes';

