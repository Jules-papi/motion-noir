import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';

export interface Translations {
  feed: string;
  discovery: string;
  events: string;
  clubs: string;
  forum: string;
  chat: string;
  profile: string;
  adminPanel: string;
  wallet: string;
  notifications: string;
  searchPlaceholder: string;
  createPost: string;
  dualVerified: string;
  dualVerifiedDesc: string;
  privateVault: string;
  requestKey: string;
  keyGranted: string;
  ndaRequired: string;
  signNda: string;
  viewOnce: string;
  viewOnceOpened: string;
  ratioCouples: string;
  ratioWomen: string;
  ratioMen: string;
  ratioTrios: string;
  quotaFull: string;
  applyToEvent: string;
  pendingApproval: string;
  approvedPay: string;
  ticketReady: string;
}

export const DICTIONARY: Record<SupportedLanguage, Translations> = {
  tr: {
    feed: 'Nocturne Günlüğü',
    discovery: 'Cemiyet Sicili',
    events: 'Özel Salonlar',
    clubs: 'Çevreler & Cemiyetler',
    forum: 'Kürsü & Münazara',
    chat: 'Kriptolu Mesajlaşma',
    profile: 'Gizli Dosya',
    adminPanel: 'Küratör Paneli',
    wallet: 'Kasa & Hazine',
    notifications: 'Bildirimler',
    searchPlaceholder: 'Profil, cemiyet veya özel gece ara...',
    createPost: 'Bildiri Yayınla',
    dualVerified: 'Karşılıklı Doğrulanmış Partnerlik',
    dualVerifiedDesc: 'Her iki partner de kimlik ve ilişki onayını karşılıklı teyit etmiştir.',
    privateVault: 'Mühürlü Özel Kasa',
    requestKey: 'Kasa Anahtarı Talep Et',
    keyGranted: 'Kasa Erişimi Verildi',
    ndaRequired: 'Dijital Rıza & Gizlilik Sözleşmesi (NDA)',
    signNda: 'Gizlilik Sözleşmesini İmzala',
    viewOnce: 'Tek Seferlik Gizli Görsel',
    viewOnceOpened: 'Görüntülendi ve İmha Edildi',
    ratioCouples: 'Çiftler',
    ratioWomen: 'Tekil Kadınlar',
    ratioMen: 'Tekil Erkekler',
    ratioTrios: 'Üçlü Katılımcılar',
    quotaFull: 'Kontenjan Dolu',
    applyToEvent: 'Kabul Talebi Gönder',
    pendingApproval: 'Küratör İnceliyor...',
    approvedPay: 'Onaylandı · Giriş Temin Et',
    ticketReady: 'Kişiye Özel Giriş QR',
  },
  nl: {
    feed: 'Kroniek',
    discovery: 'Het Register',
    events: 'Exclusieve Salons',
    clubs: 'Kringen & Chapitres',
    forum: 'Debatkamers',
    chat: 'Versleutelde Berichten',
    profile: 'Privé Dossier',
    adminPanel: 'Curator Beheer',
    wallet: 'Schatkist',
    notifications: 'Meldingen',
    searchPlaceholder: 'Zoek dossiers, clubs of salons...',
    createPost: 'Nieuwe Publicatie',
    dualVerified: 'Duaal Geverifieerd Koppel',
    dualVerifiedDesc: 'Beide partners hebben hun relatie en identiteit wederzijds bevestigd.',
    privateVault: 'Verzegelde Privé Kluis',
    requestKey: 'Toegangssleutel Vragen',
    keyGranted: 'Toegang Verleend',
    ndaRequired: 'Digitale Geheimhouding & NDA',
    signNda: 'Onderteken Geheimhouding',
    viewOnce: 'Eenmalige Media (Zelfvernietigend)',
    viewOnceOpened: 'Geopend & Vernietigd',
    ratioCouples: 'Koppels',
    ratioWomen: 'Enkele Vrouwen',
    ratioMen: 'Enkele Mannen',
    ratioTrios: 'Trio / Throuple',
    quotaFull: 'Volgeboekt',
    applyToEvent: 'Aanvraag Verzenden',
    pendingApproval: 'Beoordeling Lopend...',
    approvedPay: 'Goedgekeurd · Toegang Bevestigen',
    ticketReady: 'Toegang QR-Token',
  },
  en: {
    feed: 'The Chronicle',
    discovery: 'The Registry',
    events: 'Exclusive Salons',
    clubs: 'Cercles & Chapitres',
    forum: 'Chambers & Debates',
    chat: 'Encrypted Dispatches',
    profile: 'Private Dossier',
    adminPanel: 'Curator Panel',
    wallet: 'Treasury',
    notifications: 'Dispatches & Alerts',
    searchPlaceholder: 'Search dossiers, cercles or private soirées...',
    createPost: 'Dispatch Entry',
    dualVerified: 'Dual-Attested Partners',
    dualVerifiedDesc: 'Both partners have mutually affirmed their relationship & biometric standing.',
    privateVault: 'Sealed Private Chamber',
    requestKey: 'Request Chamber Key',
    keyGranted: 'Chamber Key Granted',
    ndaRequired: 'Digital Discretion & Non-Disclosure Accord (NDA)',
    signNda: 'Execute Discretion Accord',
    viewOnce: 'Confidential Ephemeral Plate',
    viewOnceOpened: 'Plate Unsealed & Destroyed',
    ratioCouples: 'Couples',
    ratioWomen: 'Individual Women',
    ratioMen: 'Individual Men',
    ratioTrios: 'Trios & Polycule',
    quotaFull: 'Salon at Capacity',
    applyToEvent: 'Submit Admission Request',
    pendingApproval: 'Vetting in Progress...',
    approvedPay: 'Approved · Confirm Admission',
    ticketReady: 'Encrypted Entry Token (QR)',
  },
};

export const EUR_TRY_RATE = 35; // 1 EUR = ~35 TRY

export function formatCurrency(amountInTry: number, currency: SupportedCurrency): string {
  if (amountInTry === 0) return currency === 'EUR' ? 'Gratis / Free' : 'Ücretsiz';
  if (currency === 'EUR') {
    const inEur = Math.max(1, Math.round(amountInTry / EUR_TRY_RATE));
    return `€${inEur}`;
  }
  return `${amountInTry} ₺`;
}
