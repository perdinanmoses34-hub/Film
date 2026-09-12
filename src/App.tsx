import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  MovieRow 
} from './components/MovieRow';
import { 
  VideoPlayerModal 
} from './components/VideoPlayerModal';
import { 
  AISearchModal 
} from './components/AISearchModal';
import { 
  OfflineLibrary 
} from './components/OfflineLibrary';
import { 
  AnalyticsDashboard 
} from './components/AnalyticsDashboard';
import { 
  SubscriptionModal 
} from './components/SubscriptionModal';
import { 
  AdminPanel 
} from './components/AdminPanel';
import { 
  UserProfileModal 
} from './components/UserProfileModal';
import { 
  NotificationCenter 
} from './components/NotificationCenter';
import { 
  SocialShareModal 
} from './components/SocialShareModal';
import { 
  DriveSyncModal 
} from './components/DriveSyncModal';
import { 
  AdminLoginModal 
} from './components/AdminLoginModal';
import { 
  initAuth, 
  setCachedAccessToken,
  isSuperAdmin 
} from './lib/firebaseAuth';
import { User } from 'firebase/auth';
import { 
  Movie, 
  UserProfile, 
  WatchProgress, 
  OfflineDownload, 
  UserReview, 
  NotificationItem 
} from './types';
import { 
  INITIAL_MOVIES, 
  INITIAL_REVIEWS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialMovies';
import { 
  loadWatchlist, 
  saveWatchlist, 
  loadProgressMap, 
  saveProgress, 
  loadOfflineDownloads, 
  saveOfflineDownload, 
  removeOfflineDownload, 
  clearAllOfflineDownloads,
  loadUserProfile,
  saveUserProfile
} from './utils/storage';
import { 
  WifiOff, 
  Sparkles, 
  Crown, 
  HardDrive, 
  Search, 
  Flame, 
  Film,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  testFirestoreConnection, 
  subscribeMovies, 
  saveMovieToFirestore, 
  saveMoviesBatchToFirestore, 
  deleteMovieFromFirestore 
} from './lib/firestoreService';
import { extractGoogleDriveId } from './utils/driveUtils';

export default function App() {
  // Movie Database State: load from localStorage cache first if available
  const [movies, setMovies] = useState<Movie[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cinedrive_movies_catalog_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Cannot load cached movies:', e);
      }
    }
    return INITIAL_MOVIES;
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Watchlist & History
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, WatchProgress>>({});
  const [downloads, setDownloads] = useState<OfflineDownload[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile());

  // Offline Mode & Connectivity State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Modal Control States
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showDriveSyncModal, setShowDriveSyncModal] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [shareMovieTarget, setShareMovieTarget] = useState<Movie | null>(null);

  // Admin Access & Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cinedrive_admin_auth') === 'true';
    }
    return false;
  });

  // Google Drive & Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [syncedDriveMovieCount, setSyncedDriveMovieCount] = useState<number>(0);

  // Load persistent local data on mount & initialize Auth & Firestore real-time listeners
  useEffect(() => {
    setWatchlist(loadWatchlist());
    setProgressMap(loadProgressMap());
    setDownloads(loadOfflineDownloads());

    // Test Firestore connectivity
    testFirestoreConnection();

    // 1. Listen for real-time Firestore catalog updates (all devices & users)
    const unsubFirestore = subscribeMovies((firestoreMovies) => {
      if (firestoreMovies && firestoreMovies.length > 0) {
        setMovies((prev) => {
          const fsMap = new Map(firestoreMovies.map((m) => [m.id, m]));
          const prevRemaining = prev.filter((m) => !fsMap.has(m.id));
          const merged = [...firestoreMovies, ...prevRemaining];
          try {
            localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(merged.slice(0, 100)));
          } catch (e) {}
          return merged;
        });
      }
    });

    // 2. Initialize Firebase Auth listener
    const unsubscribeAuth = initAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) setDriveAccessToken(token);
        if (user && isSuperAdmin(user)) {
          setIsAdmin(true);
          localStorage.setItem('cinedrive_admin_auth', 'true');
        }
      },
      () => {
        setGoogleUser(null);
        setDriveAccessToken(null);
      }
    );

    // 3. Fetch movies from server API (persisted in data_saved_movies.json)
    fetch('/api/movies')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setMovies((prev) => {
            const serverMap = new Map(data.data.map((m: Movie) => [m.id, m]));
            const prevRemaining = prev.filter((m) => !serverMap.has(m.id));
            const merged = [...data.data, ...prevRemaining];
            try {
              localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(merged.slice(0, 100)));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Server endpoint notice:', err);
      });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  // Handle synced movies applied from Drive
  const handleApplySyncedMovies = (driveMovies: Movie[]) => {
    if (!driveMovies || driveMovies.length === 0) return;

    // Reset filters to ensure the user immediately sees their synced movies on dashboard!
    setActiveCategory('Semua');
    setSearchQuery('');

    // Update state immediately
    setMovies((prevMovies) => {
      const driveIds = new Set(driveMovies.map((m) => m.id));
      const filteredPrev = prevMovies.filter((m) => !driveIds.has(m.id));
      const merged = [...driveMovies, ...filteredPrev];
      try {
        localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(merged.slice(0, 100)));
      } catch (e) {}
      return merged;
    });

    setSyncedDriveMovieCount(driveMovies.length);

    // Persist to Firestore database
    saveMoviesBatchToFirestore(driveMovies);

    // Persist to Server database (data_saved_movies.json)
    fetch('/api/movies/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movies: driveMovies })
    }).catch(err => console.warn('Server batch save notice:', err));

    // Show instant toast banner
    setSyncToast(`Berhasil! ${driveMovies.length} film Google Drive tersimpan dan langsung tampil di Dashboard.`);
    setTimeout(() => setSyncToast(null), 6000);

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-drive-' + Date.now(),
      title: 'Koleksi Google Drive Berhasil Disinkronkan',
      message: `${driveMovies.length} film dari folder Google Drive Anda berhasil tersimpan secara permanen dan tampil di bagian atas dashboard untuk semua pengguna.`,
      timestamp: 'Baru saja',
      isRead: false,
      type: 'system',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Watchlist toggle handler
  const handleToggleWatchlist = (movie: Movie) => {
    const safeWatchlist = watchlist || [];
    const isAlreadyIn = safeWatchlist.includes(movie.id);
    const updated = isAlreadyIn
      ? safeWatchlist.filter((id) => id !== movie.id)
      : [...safeWatchlist, movie.id];

    setWatchlist(updated);
    saveWatchlist(updated);

    // Notify user if added
    if (!isAlreadyIn) {
      const newNotif: NotificationItem = {
        id: 'notif-wl-' + Date.now(),
        title: 'Film Ditambahkan ke Daftar Tontonan',
        message: `"${movie.title}" kini ada di daftar Anda. Kami akan mengabari saat rilis update versi resolusi 4K.`,
        timestamp: 'Baru saja',
        isRead: false,
        type: 'release',
        movieId: movie.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Play movie with VIP access check
  const handlePlayMovie = (movie: Movie) => {
    if (movie.isPremium && !userProfile.isVip) {
      setShowSubscriptionModal(true);
      return;
    }
    setPlayingMovie(movie);
  };

  // Offline download handler
  const handleDownloadMovie = (movie: Movie) => {
    const existing = downloads.find((d) => d.movieId === movie.id);
    if (existing) {
      setShowOfflineModal(true);
      return;
    }

    const newDownload: OfflineDownload = {
      movieId: movie.id,
      movieTitle: movie.title,
      posterUrl: movie.posterUrl,
      quality: movie.resolution,
      sizeBytes: movie.fileSizeBytes || 1024 * 1024 * 900,
      downloadedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      progress: 100,
    };

    const updated = saveOfflineDownload(newDownload);
    setDownloads(updated);
    setShowOfflineModal(true);
  };

  const handleDeleteDownload = (movieId: string) => {
    const updated = removeOfflineDownload(movieId);
    setDownloads(updated);
  };

  const handleClearAllDownloads = () => {
    clearAllOfflineDownloads();
    setDownloads([]);
  };

  // Real-time progress update handler
  const handleUpdateProgress = (progress: WatchProgress) => {
    saveProgress(progress);
    setProgressMap((prev) => ({
      ...prev,
      [progress.movieId]: progress,
    }));
  };

  // Reviews handlers
  const handleAddReview = (newReviewData: Partial<UserReview>) => {
    const newRev: UserReview = {
      id: 'rev-' + Date.now(),
      movieId: newReviewData.movieId || '',
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      rating: newReviewData.rating || 5,
      comment: newReviewData.comment || '',
      date: 'Baru saja',
      likesCount: 0,
      hasSpoiler: Boolean(newReviewData.hasSpoiler),
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
            isLiked: !r.isLiked,
          };
        }
        return r;
      })
    );
  };

  // Subscription activation
  const handleActivateSubscription = (planId: string, tierName: string) => {
    const updated: UserProfile = {
      ...userProfile,
      isVip: true,
      vipTierName: tierName,
    };
    setUserProfile(updated);
    saveUserProfile(updated);

    // Push notification for VIP activation
    const vipNotif: NotificationItem = {
      id: 'notif-vip-' + Date.now(),
      title: 'Selamat Datang di CineDrive VIP!',
      message: `Status ${tierName} Anda telah aktif. Seluruh katalog film Google Drive resolusi 4K UHD kini dapat diputar tanpa batas.`,
      timestamp: 'Baru saja',
      isRead: false,
      type: 'subscription',
    };
    setNotifications((prev) => [vipNotif, ...prev]);
  };

  // Admin movie operations
  const handleAddMovie = async (movieData: any) => {
    const cleanDriveId = extractGoogleDriveId(movieData.googleDriveFileId || '');
    const cleanMovie: Movie = {
      id: movieData.id || `movie-${Date.now()}`,
      title: movieData.title,
      originalTitle: movieData.originalTitle || movieData.title,
      synopsis: movieData.synopsis || 'Film disinkronkan dari Google Drive.',
      posterUrl: movieData.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
      backdropUrl: movieData.backdropUrl || movieData.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      genres: Array.isArray(movieData.genres) && movieData.genres.length > 0 ? movieData.genres : ['Google Drive', 'Koleksi Utama'],
      year: Number(movieData.year) || new Date().getFullYear(),
      durationMinutes: Number(movieData.durationMinutes) || 110,
      rating: Number(movieData.rating) || 8.8,
      ageRating: movieData.ageRating || '13+',
      isPremium: Boolean(movieData.isPremium),
      price: movieData.isPremium ? (Number(movieData.price) || 35000) : 0,
      googleDriveFileId: cleanDriveId,
      driveShareUrl: `https://drive.google.com/file/d/${cleanDriveId}/view?usp=sharing`,
      streamEmbedUrl: `https://drive.google.com/file/d/${cleanDriveId}/preview`,
      trailerVideoUrl: movieData.trailerVideoUrl || '',
      resolution: movieData.resolution || '1080p FHD',
      director: movieData.director || 'Google Drive Cinema',
      cast: Array.isArray(movieData.cast) ? movieData.cast : (movieData.cast ? [movieData.cast] : ['Koleksi Pribadi']),
      audio: ['Indonesian (Dolby 5.1)', 'English (Stereo)'],
      subtitles: ['Bahasa Indonesia', 'English'],
      views: 120,
      totalWatchHours: 85,
      releaseDate: new Date().toISOString().split('T')[0],
      isNewRelease: true,
      isTrending: Boolean(movieData.isTrending),
    };

    // 1. Reset filter so new movie is immediately visible on dashboard!
    setActiveCategory('Semua');
    setSearchQuery('');

    // 2. Prepend to local state & localStorage
    setMovies((prev) => {
      const merged = [cleanMovie, ...prev.filter((m) => m.id !== cleanMovie.id)];
      try {
        localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(merged.slice(0, 100)));
      } catch (e) {}
      return merged;
    });

    // 3. Save to Firestore (Real-time sync to all users)
    saveMovieToFirestore(cleanMovie).catch((err) => {
      console.warn('Firestore direct save warning:', err);
    });

    // 4. Save to Backend Server (file-system persistent data_saved_movies.json)
    try {
      await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanMovie),
      });
    } catch (e) {
      console.warn('API tambah film offline, data tersimpan di browser & Firestore:', e);
    }

    // 5. Toast notification
    setSyncToast(`Film "${cleanMovie.title}" berhasil disimpan dan langsung tampil di Dashboard!`);
    setTimeout(() => setSyncToast(null), 6000);
  };

  const handleDeleteMovie = async (movieId: string) => {
    // 1. Delete from Firestore
    deleteMovieFromFirestore(movieId).catch((err) => {
      console.warn('Firestore delete notice:', err);
    });

    // 2. Delete from Backend Server
    try {
      await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API hapus film offline:', e);
    }

    // 3. Delete from local state & cache
    setMovies((prev) => {
      const updated = prev.filter((m) => m.id !== movieId);
      try {
        localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(updated.slice(0, 100)));
      } catch (e) {}
      return updated;
    });

    setSyncToast('Film berhasil dihapus dari katalog.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleToggleMoviePremium = (movieId: string) => {
    setMovies((prev) => {
      const updated = prev.map((m) => {
        if (m.id === movieId) {
          const mod = { ...m, isPremium: !m.isPremium };
          saveMovieToFirestore(mod).catch(() => {});
          return mod;
        }
        return m;
      });
      try {
        localStorage.setItem('cinedrive_movies_catalog_v1', JSON.stringify(updated.slice(0, 100)));
      } catch (e) {}
      return updated;
    });
  };

  // Filter movies for display
  const safeMovies = movies || [];
  const featuredMovie = safeMovies.find((m) => m.isFeatured) || safeMovies[0];

  const filteredMovies = safeMovies.filter((m) => {
    // If offline mode is enabled, only show downloaded movies
    if (isOfflineMode) {
      const isDownloaded = (downloads || []).some((d) => d.movieId === m.id);
      if (!isDownloaded) return false;
    }

    // Category filter
    const matchesCategory =
      activeCategory === 'Semua' || (m.genres && m.genres.includes(activeCategory));

    // Search query filter
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.genres && m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  // Categorized Rows: Dedicated row for all Google Drive movies and newly added films!
  const googleDriveMovies = safeMovies.filter(
    (m) =>
      Boolean(m.googleDriveFileId) ||
      m.id.startsWith('gdrive-') ||
      (m.genres && (m.genres.includes('Google Drive') || m.genres.includes('Koleksi Utama'))) ||
      m.isNewRelease
  );
  const trendingMovies = safeMovies.filter((m) => (m.views || 0) > 20000);
  const premiumVipMovies = safeMovies.filter((m) => m.isPremium);
  const actionMovies = safeMovies.filter((m) => m.genres && m.genres.includes('Action'));
  const sciFiMovies = safeMovies.filter((m) => m.genres && m.genres.includes('Sci-Fi'));
  const horrorMovies = safeMovies.filter((m) => m.genres && m.genres.includes('Horor'));

  const unreadNotificationsCount = (notifications || []).filter((n) => !n.isRead).length;

  const handleAdminLoginSuccess = (user?: User) => {
    setIsAdmin(true);
    localStorage.setItem('cinedrive_admin_auth', 'true');
    if (user) setGoogleUser(user);
    const newNotif: NotificationItem = {
      id: 'notif-admin-' + Date.now(),
      title: 'Mode Administrator Aktif',
      message: 'Akses penuh diberikan: Anda kini dapat mengatur integrasi Google Drive dan mengelola seluruh katalog film.',
      type: 'system',
      timestamp: 'Baru saja',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setShowAdminModal(true);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('cinedrive_admin_auth');
    setShowAdminModal(false);
    setShowDriveSyncModal(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white pb-20 md:pb-8">
      
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="sticky top-0 z-40 bg-amber-500 text-neutral-950 px-4 py-2 font-bold text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Mode Nonton Offline Aktif • Menampilkan film yang telah diunduh di perangkat Anda</span>
          </div>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="px-2.5 py-1 rounded bg-neutral-950 text-white text-[11px] font-semibold hover:bg-neutral-800"
          >
            Kembali Online
          </button>
        </div>
      )}

      {/* Primary Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenAiSearch={() => setShowAiModal(true)}
        onOpenOfflineLibrary={() => setShowOfflineModal(true)}
        onOpenAnalytics={() => setShowAnalyticsModal(true)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenDriveSync={() => setShowDriveSyncModal(true)}
        isDriveConnected={Boolean(googleUser && driveAccessToken)}
        unreadNotificationsCount={unreadNotificationsCount}
        notifications={notifications}
        offlineDownloadCount={downloads.length}
        userProfile={userProfile}
        isVip={userProfile.isVip}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

      {/* Real-time Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center justify-between sticky top-14 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-200">{syncToast}</span>
          </div>
          <button 
            onClick={() => setSyncToast(null)} 
            className="text-emerald-400 hover:text-white px-2 py-0.5 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Mode Bar - Active only for Administrator */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-white">Mode Pengelola (Admin) Aktif:</span>
              <span className="text-amber-300/80 text-[11px]">perdinan.moses34@guru.smp.belajar.id</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="adminbar-manage-movies-btn"
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Atur Film & Katalog</span>
              </button>
              <button
                id="adminbar-sync-drive-btn"
                onClick={() => setShowDriveSyncModal(true)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Sinkron Google Drive</span>
              </button>
              <button
                id="adminbar-logout-btn"
                onClick={handleAdminLogout}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
              >
                Keluar Mode Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8">
        
        {/* If user is searching or filtering, show search results grid */}
        {searchQuery.trim() !== '' || activeCategory !== 'Semua' ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-rose-500" />
                  <span>
                    {searchQuery.trim() ? `Hasil Pencarian: "${searchQuery}"` : `Kategori: ${activeCategory}`}
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Ditemukan {filteredMovies.length} film siap dialirkan dari Google Drive
                </p>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Semua');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Reset Filter
              </button>
            </div>

            {filteredMovies.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-neutral-900/30 rounded-2xl border border-neutral-800">
                <Film className="w-12 h-12 text-neutral-600 mx-auto" />
                <h3 className="font-bold text-base text-neutral-300">
                  Tidak Ada Film yang Cocok
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Coba kata kunci lain atau gunakan fitur Rekomendasi AI kami untuk menemukan film yang sesuai dengan mood Anda.
                </p>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tanya Rekomendasi AI</span>
                </button>
              </div>
            ) : (
              <MovieRow
                title=""
                movies={filteredMovies}
                onPlayMovie={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={(movie) => setShareMovieTarget(movie)}
                onDownloadMovie={handleDownloadMovie}
                progressMap={progressMap}
              />
            )}
          </div>
        ) : (
          /* Normal Home View: Hero Banner & Curated Rows */
          <>
            {/* Cinematic Hero Banner */}
            {featuredMovie && !isOfflineMode && (
              <HeroBanner
                movie={featuredMovie}
                onPlay={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={() => setShareMovieTarget(featuredMovie)}
                progress={progressMap[featuredMovie.id]}
              />
            )}

            {/* Google Drive Personal Folder Callout Banner - EXCLUSIVE to Admin */}
            {isAdmin && !isOfflineMode && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        Google Drive Anda Terhubung
                      </h3>
                      {googleUser && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {googleUser.displayName || 'Akun Aktif'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {syncedDriveMovieCount > 0 
                        ? `${syncedDriveMovieCount} film dari subfolder kategori Drive Anda aktif di aplikasi.`
                        : 'Bagi film ke subfolder kategori di Google Drive Anda (Action, Horor, Sci-Fi) untuk sinkronisasi otomatis.'}
                    </p>
                  </div>
                </div>

                <button
                  id="hero-drive-sync-btn"
                  onClick={() => setShowDriveSyncModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-neutral-950" />
                  <span>{googleUser ? 'Kelola Folder Drive' : 'Hubungkan Drive Anda'}</span>
                </button>
              </div>
            )}

            {/* Quick AI Suggestion Callout Banner */}
            {!isOfflineMode && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-950 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-purple-950/20">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Bingung Ingin Menonton Apa Malam Ini?
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Gunakan AI Gemini untuk mencari film berdasarkan suasana hati, alur cerita, atau latar kota.
                    </p>
                  </div>
                </div>

                <button
                  id="hero-ai-recommendation-btn"
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cari Kategori dengan AI</span>
                </button>
              </div>
            )}

            {/* Curated Movie Rows */}
            <div className="space-y-8">

              {/* All Google Drive Movies & Recent Additions Row */}
              {googleDriveMovies.length > 0 && (
                <MovieRow
                  title="🎬 Koleksi Film Google Drive & Rilisan Terbaru"
                  subtitle="Film yang disinkronkan langsung dari Google Drive Anda dan tersimpan di sistem"
                  icon={<HardDrive className="w-5 h-5 text-emerald-400" />}
                  movies={googleDriveMovies}
                  onPlayMovie={handlePlayMovie}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenShare={(movie) => setShareMovieTarget(movie)}
                  onDownloadMovie={handleDownloadMovie}
                  downloads={downloads}
                  progressMap={progressMap}
                />
              )}
              
              {/* Trending Movies Row */}
              <MovieRow
                title="Sedang Tren & Populer di Indonesia"
                subtitle="Film dengan jam penayangan tertinggi minggu ini"
                icon={<Flame className="w-5 h-5 text-amber-500" />}
                movies={trendingMovies}
                onPlayMovie={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={(movie) => setShareMovieTarget(movie)}
                onDownloadMovie={handleDownloadMovie}
                downloads={downloads}
                progressMap={progressMap}
              />

              {/* Premium VIP Exclusives */}
              <MovieRow
                title="Koleksi VIP Eksklusif 4K UHD"
                subtitle="Kualitas gambar maksimal dengan bitrate tinggi dari Google Drive Storage"
                icon={<Crown className="w-5 h-5 text-amber-400" />}
                movies={premiumVipMovies}
                onPlayMovie={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={(movie) => setShareMovieTarget(movie)}
                onDownloadMovie={handleDownloadMovie}
                downloads={downloads}
                progressMap={progressMap}
              />

              {/* Action & Silat */}
              <MovieRow
                title="Aksi & Silat Intens"
                subtitle="Ketegangan tanpa henti dengan koreografi bela diri spektakuler"
                movies={actionMovies}
                onPlayMovie={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={(movie) => setShareMovieTarget(movie)}
                onDownloadMovie={handleDownloadMovie}
                downloads={downloads}
                progressMap={progressMap}
              />

              {/* Sci-Fi & Cyberpunk */}
              <MovieRow
                title="Fiksi Ilmiah & Petualangan Masa Depan"
                subtitle="Eksplorasi luar angkasa dan teknologi futuristik"
                movies={sciFiMovies}
                onPlayMovie={handlePlayMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenShare={(movie) => setShareMovieTarget(movie)}
                onDownloadMovie={handleDownloadMovie}
                downloads={downloads}
                progressMap={progressMap}
              />

              {/* Horor & Cerita Misteri */}
              {horrorMovies.length > 0 && (
                <MovieRow
                  title="Horor & Misteri Menegangkan"
                  subtitle="Misteri mistis dan ketegangan psikologis yang memikat"
                  movies={horrorMovies}
                  onPlayMovie={handlePlayMovie}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenShare={(movie) => setShareMovieTarget(movie)}
                  onDownloadMovie={handleDownloadMovie}
                  downloads={downloads}
                  progressMap={progressMap}
                />
              )}

            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 border-t border-neutral-900 mt-16 text-neutral-500 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-xs">
              C
            </div>
            <span className="font-bold text-neutral-300">CineDrive Stream</span>
            <span>• Platform Streaming Google Drive API & Sinkronisasi Real-Time</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {isAdmin ? (
              <>
                <button 
                  id="footer-admin-panel-btn"
                  onClick={() => setShowAdminModal(true)} 
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel Film & Konten</span>
                </button>
                <button 
                  id="footer-drive-sync-btn"
                  onClick={() => setShowDriveSyncModal(true)} 
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Sinkron Google Drive</span>
                </button>
                <button 
                  id="footer-analytics-btn"
                  onClick={() => setShowAnalyticsModal(true)} 
                  className="hover:text-neutral-300 cursor-pointer"
                >
                  Analitik Tontonan
                </button>
                <button 
                  id="footer-admin-logout-btn"
                  onClick={handleAdminLogout} 
                  className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                >
                  Keluar Admin
                </button>
              </>
            ) : (
              <>
                <button 
                  id="footer-offline-btn"
                  onClick={() => setShowOfflineModal(true)} 
                  className="hover:text-neutral-300 cursor-pointer"
                >
                  Mode Offline
                </button>
                <button 
                  id="footer-subscription-btn"
                  onClick={() => setShowSubscriptionModal(true)} 
                  className="hover:text-rose-400 font-bold cursor-pointer"
                >
                  Paket VIP
                </button>
                <button 
                  id="footer-admin-login-btn"
                  onClick={() => setShowAdminLoginModal(true)} 
                  className="text-neutral-500 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Login Khusus Administrator Bioskop & Google Drive"
                >
                  <Lock className="w-3 h-3" />
                  <span>Login Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* Video Player Modal */}
      {playingMovie && (
        <VideoPlayerModal
          movie={playingMovie}
          onClose={() => setPlayingMovie(null)}
          userProfile={userProfile}
          initialProgress={progressMap[playingMovie.id]}
          onUpdateProgress={handleUpdateProgress}
          onOpenSubscription={() => setShowSubscriptionModal(true)}
          onDownload={() => handleDownloadMovie(playingMovie)}
          isDownloaded={(downloads || []).some(d => d.movieId === playingMovie.id)}
          isInWatchlist={(watchlist || []).includes(playingMovie.id)}
          onToggleWatchlist={handleToggleWatchlist}
          reviews={reviews}
          onAddReview={handleAddReview}
          onLikeReview={handleLikeReview}
        />
      )}

      {/* AI Category Search Modal */}
      {showAiModal && (
        <AISearchModal
          onClose={() => setShowAiModal(false)}
          movies={movies}
          onPlayMovie={handlePlayMovie}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Offline Mode Library Modal */}
      {showOfflineModal && (
        <OfflineLibrary
          onClose={() => setShowOfflineModal(false)}
          downloads={downloads}
          onPlayOffline={handlePlayMovie}
          onDeleteDownload={handleDeleteDownload}
          onClearAll={handleClearAllDownloads}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
          movies={movies}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalyticsModal && (
        <AnalyticsDashboard
          onClose={() => setShowAnalyticsModal(false)}
          userProfile={userProfile}
          progressList={Object.values(progressMap)}
        />
      )}

      {/* Subscription & Digital Payment Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
          onActivateSubscription={handleActivateSubscription}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanel
          onClose={() => setShowAdminModal(false)}
          movies={movies}
          onAddMovie={handleAddMovie}
          onDeleteMovie={handleDeleteMovie}
          onToggleMoviePremium={handleToggleMoviePremium}
          onOpenDriveSync={() => setShowDriveSyncModal(true)}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          userProfile={userProfile}
          onUpdateProfile={(updated) => {
            setUserProfile(updated);
            saveUserProfile(updated);
          }}
          movies={movies}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onPlayMovie={handlePlayMovie}
          progressMap={progressMap}
          onClearHistory={() => {
            localStorage.removeItem('cinedrive_progress');
            setProgressMap({});
          }}
          onOpenSubscription={() => {
            setShowProfileModal(false);
            setShowSubscriptionModal(true);
          }}
        />
      )}

      {/* Notification Center Modal */}
      {showNotificationModal && (
        <NotificationCenter
          onClose={() => setShowNotificationModal(false)}
          notifications={notifications}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
          onPlayMovieById={(movieId) => {
            const m = movies.find((item) => item.id === movieId);
            if (m) handlePlayMovie(m);
          }}
        />
      )}

      {/* Social Share Modal */}
      {shareMovieTarget && (
        <SocialShareModal
          movie={shareMovieTarget}
          onClose={() => setShareMovieTarget(null)}
        />
      )}

      {/* Google Drive Folder Sync Modal */}
      {showDriveSyncModal && (
        <DriveSyncModal
          onClose={() => setShowDriveSyncModal(false)}
          authUser={googleUser}
          accessToken={driveAccessToken}
          onAuthSuccess={(user, token) => {
            setGoogleUser(user);
            setDriveAccessToken(token);
            setCachedAccessToken(token);
          }}
          onLogoutSuccess={() => {
            setGoogleUser(null);
            setDriveAccessToken(null);
            setCachedAccessToken(null);
          }}
          onApplySyncedMovies={handleApplySyncedMovies}
          currentFolderId="1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g"
        />
      )}

      {/* Admin Dedicated Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          isAdmin={isAdmin}
          adminUser={googleUser}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onAdminLogout={handleAdminLogout}
          onOpenAdminPanel={() => {
            setShowAdminLoginModal(false);
            setShowAdminModal(true);
          }}
          onOpenDriveSync={() => {
            setShowAdminLoginModal(false);
            setShowDriveSyncModal(true);
          }}
        />
      )}

    </div>
  );
}
