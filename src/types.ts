export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  genres: string[];
  year: number;
  durationMinutes: number;
  rating: number;
  ageRating: 'SU' | '13+' | '17+' | '21+';
  isPremium: boolean;
  price?: number;
  googleDriveFileId: string;
  fileSizeBytes?: number;
  driveShareUrl?: string;
  streamEmbedUrl?: string;
  trailerVideoUrl: string;
  resolution: '4K UHD' | '1080p FHD' | '720p HD';
  director: string;
  cast: string[];
  audio: string[];
  subtitles: string[];
  views: number;
  totalWatchHours: number;
  releaseDate: string;
  isTrending?: boolean;
  isNewRelease?: boolean;
  isSeries?: boolean;
  totalEpisodes?: number;
  latestEpisode?: string;
  nextEpisodeReleaseDate?: string;
}

export interface WatchProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  progressPercent: number;
  lastWatchedAt: string;
  deviceId: string;
  deviceName: string;
}

export interface UserReview {
  id: string;
  movieId: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  hasSpoiler: boolean;
  likesCount: number;
  isLiked?: boolean;
}

export interface OfflineDownload {
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  quality: string;
  sizeBytes: number;
  downloadedAt: string;
  blobUrl?: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  movieId?: string;
  type: 'release' | 'series_reminder' | 'subscription' | 'system';
  timestamp: string;
  isRead: boolean;
}

export interface DailyWatchStat {
  date: string;
  dayName: string;
  minutes: number;
  moviesWatched: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'bulan' | 'tahun';
  description: string;
  features: string[];
  badge?: string;
  resolution: string;
  deviceLimit: number;
  colorScheme: 'slate' | 'rose' | 'amber';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isVip: boolean;
  vipTierName?: string;
  vipExpiresAt?: string;
  dailyGoalMinutes: number;
  streakDays: number;
  favoriteGenres: string[];
  currentDevice: {
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tv' | 'tablet';
  };
}

export interface PaymentTransaction {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  method: 'qris' | 'gopay' | 'ovo' | 'dana' | 'bca_va' | 'card';
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  customerName: string;
  customerEmail: string;
}
