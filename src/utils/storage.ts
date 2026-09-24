/**
 * Major Club LocalStorage Persistence Engine
 * Keeps all member state, wallet balances, unlocked posts, club memberships,
 * forum debates, and conversations persistent across sessions.
 */

const STORAGE_KEY = 'maison_noir_state_v2';

export interface PersistentState {
  walletBalance?: number;
  posts?: any[];
  events?: any[];
  clubs?: any[];
  forumTopics?: any[];
  conversations?: any[];
  currentUser?: any;
  discoveryProfiles?: any[];
  language?: string;
  currency?: string;
}

export function loadPersistentState(): PersistentState | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read from localStorage', err);
    return null;
  }
}

export function savePersistentState(partial: Partial<PersistentState>) {
  try {
    if (typeof window === 'undefined') return;
    const current = loadPersistentState() || {};
    const updated = { ...current, ...partial, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

export function clearPersistentState() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to clear localStorage', err);
  }
}
