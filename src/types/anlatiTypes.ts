import { UserProfile, PlatformEvent, MembershipTier } from '../types';

export type ProfileType = 'single' | 'couple' | 'trio' | 'single_female' | 'single_male' | 'couple_mf' | 'couple_ff' | 'couple_mm';

export type RelationshipStatus = 
  | 'single' 
  | 'couple' 
  | 'married' 
  | 'open_relationship' 
  | 'poly' 
  | 'exploring';

export interface PersonInfo {
  name: string;
  age: number;
  gender: string;
  avatar: string;
  bio?: string;
}

export interface CoupleDetails {
  personA: PersonInfo;
  personB: PersonInfo;
  coupleBio: string;
  coupleInterests: string[];
  lookingFor: string[]; // e.g. ['Couples', 'Single Females', 'Events']
  anniversary?: string;
  photos: string[];
}

export interface PartnerConnection {
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  partnerAvatar: string;
  status: 'connected' | 'pending' | 'none' | 'dual_verified';
  connectedSince?: string;
  isPublicOnProfile: boolean;
  mutualConsentConfirmed?: boolean;
}

export type SupportedCurrency = 'EUR' | 'TRY';
export type SupportedLanguage = 'nl' | 'en' | 'tr';

export interface PrivateVaultItem {
  id: string;
  type: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  caption: string;
  isSensitive: boolean;
  uploadedAt: string;
}

export interface VaultKeyAccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterType: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export type ConnectionRequestStatus = 'pending' | 'accepted' | 'declined';

export interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderType: ProfileType;
  recipientId: string;
  status: ConnectionRequestStatus;
  sentAt: string;
  note?: string;
}

export interface EventApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: ProfileType | string;
  status: 'pending' | 'approved' | 'approved_unpaid' | 'paid' | 'rejected' | 'checked_in';
  ticketId?: string;
  price?: number;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface UserSettings {
  profileVisibility: 'everyone' | 'members_only' | 'connections_only' | 'private';
  photosVisibility: 'public' | 'connections' | 'private';
  relationshipVisibility: 'visible' | 'members_only' | 'hidden';
  onlineStatusVisible: boolean;
  distanceSharing: 'exact' | 'city_only' | 'hidden';
  allowSensitiveContent: boolean;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  connectionRequestAlerts: boolean;
}
