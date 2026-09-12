import { WatchProgress, OfflineDownload, UserProfile, UserReview } from '../types';

const PROGRESS_KEY = 'cinedrive_watch_progress_v1';
const OFFLINE_KEY = 'cinedrive_offline_items_v1';
const PROFILE_KEY = 'cinedrive_user_profile_v1';
const WATCHLIST_KEY = 'cinedrive_watchlist_v1';
const HISTORY_KEY = 'cinedrive_history_v1';
const REVIEWS_KEY = 'cinedrive_user_reviews_v1';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-8821',
  name: 'Moni Cinema',
  email: 'moni150388@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  isVip: true,
  vipTierName: 'VIP Ultra 4K Master',
  vipExpiresAt: '2027-09-11',
  dailyGoalMinutes: 90,
  streakDays: 5,
  favoriteGenres: ['Sci-Fi', 'Action', 'Horor'],
  currentDevice: {
    id: 'dev-web-01',
    name: 'Browser Ini (Aktif)',
    type: 'desktop',
  },
};

// Watch Progress Store
export function getStoredProgress(): Record<string, WatchProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {
      'movie-1': {
        movieId: 'movie-1',
        currentTime: 1420,
        duration: 7440,
        progressPercent: 19,
        lastWatchedAt: new Date().toISOString(),
        deviceId: 'dev-web-01',
        deviceName: 'Browser Ini (Aktif)'
      },
      'movie-9': {
        movieId: 'movie-9',
        currentTime: 2100,
        duration: 3600,
        progressPercent: 58,
        lastWatchedAt: new Date(Date.now() - 3600000).toISOString(),
        deviceId: 'dev-phone-02',
        deviceName: 'iPhone 15 Pro Max'
      }
    };
  } catch {
    return {};
  }
}

export function saveMovieProgress(progress: WatchProgress) {
  try {
    const current = getStoredProgress();
    current[progress.movieId] = progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

// Offline items
export function getOfflineDownloads(): OfflineDownload[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        movieId: 'movie-2',
        movieTitle: 'Misteri Alas Keramat',
        posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=80',
        quality: '1080p FHD',
        sizeBytes: 890000000,
        downloadedAt: 'Kemarin, 14:10',
        status: 'completed',
        progress: 100,
        blobUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
      }
    ];
  } catch {
    return [];
  }
}

export function saveOfflineDownloads(items: OfflineDownload[]) {
  try {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving offline items:', e);
  }
}

// User Profile
export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

// Watchlist
export function getStoredWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : ['movie-1', 'movie-3', 'movie-9'];
  } catch {
    return ['movie-1', 'movie-3', 'movie-9'];
  }
}

export function saveStoredWatchlist(ids: string[]) {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving watchlist:', e);
  }
}

// Reviews
export function getStoredReviews(): UserReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: UserReview[]) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews:', e);
  }
}

// Aliases and helpers
export const loadWatchlist = getStoredWatchlist;
export const saveWatchlist = saveStoredWatchlist;
export const loadProgressMap = getStoredProgress;
export const saveProgress = saveMovieProgress;
export const loadOfflineDownloads = getOfflineDownloads;
export const loadUserProfile = getStoredProfile;

export function saveOfflineDownload(item: OfflineDownload): OfflineDownload[] {
  const current = getOfflineDownloads();
  const filtered = current.filter(d => d.movieId !== item.movieId);
  const updated = [item, ...filtered];
  saveOfflineDownloads(updated);
  return updated;
}

export function removeOfflineDownload(movieId: string): OfflineDownload[] {
  const current = getOfflineDownloads();
  const updated = current.filter(d => d.movieId !== movieId);
  saveOfflineDownloads(updated);
  return updated;
}

export function clearAllOfflineDownloads() {
  saveOfflineDownloads([]);
}

// Format seconds into HH:MM:SS or MM:SS
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
