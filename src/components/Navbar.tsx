import React from 'react';
import { 
  Film, 
  Search, 
  Sparkles, 
  Download, 
  Bell, 
  Crown, 
  User, 
  Wifi, 
  WifiOff, 
  BarChart3, 
  ShieldCheck, 
  HardDrive,
  Lock
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';

export interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onOpenAiSearch: () => void;
  onOpenOfflineLibrary: () => void;
  onOpenAnalytics: () => void;
  onOpenSubscription: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenDriveSync?: () => void;
  isDriveConnected?: boolean;
  unreadNotificationsCount?: number;
  notifications?: NotificationItem[];
  offlineDownloadCount?: number;
  isOfflineMode?: boolean;
  onToggleOfflineSimulation?: () => void;
  userProfile?: UserProfile;
  isVip?: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

const CATEGORIES = [
  'Semua',
  'Action',
  'Sci-Fi',
  'Horor',
  'Drama',
  'Komedi',
  'Animasi',
  'Thriller',
  'Dokumenter'
];

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory = 'Semua',
  onSelectCategory,
  onOpenAiSearch,
  onOpenOfflineLibrary,
  onOpenAnalytics,
  onOpenSubscription,
  onOpenAdmin,
  onOpenProfile,
  onOpenNotifications,
  onOpenDriveSync,
  isDriveConnected = false,
  unreadNotificationsCount,
  notifications = [],
  offlineDownloadCount = 0,
  isOfflineMode = false,
  onToggleOfflineSimulation,
  userProfile,
  isVip = false,
  activeTab = 'home',
  setActiveTab,
  isAdmin = false,
  onOpenAdminLogin,
}) => {
  const unreadNotifs = typeof unreadNotificationsCount === 'number'
    ? unreadNotificationsCount
    : (notifications || []).filter(n => !n.isRead).length;

  const vipStatus = isVip || userProfile?.isVip || false;

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-neutral-950/85 border-b border-neutral-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              id="brand-logo-btn"
              onClick={() => {
                if (setActiveTab) setActiveTab('home');
                if (onSelectCategory) onSelectCategory('Semua');
                onSearchChange('');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/25 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white">CineDrive</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <HardDrive className="w-2.5 h-2.5" /> Drive API
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Cloud Cinema & Offline Player</p>
              </div>
            </button>

            {/* Desktop Navigation Links - User only sees Beranda; Admin gets controls */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                id="nav-home-btn"
                onClick={() => {
                  if (setActiveTab) setActiveTab('home');
                  if (onSelectCategory) onSelectCategory('Semua');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'home' && activeCategory === 'Semua'
                    ? 'text-white bg-neutral-800' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Beranda
              </button>

              {/* Admin-Exclusive Controls: Hidden completely from regular users */}
              {isAdmin && (
                <>
                  <button
                    id="nav-admin-btn"
                    onClick={onOpenAdmin}
                    className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Panel Film & Konten</span>
                  </button>

                  {onOpenDriveSync && (
                    <button
                      id="nav-drive-btn"
                      onClick={onOpenDriveSync}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        isDriveConnected 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sinkron Google Drive</span>
                      {isDriveConnected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>
                  )}

                  <button
                    id="nav-analytics-btn"
                    onClick={onOpenAnalytics}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Analitik</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Search bar & Action triggers */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg justify-end">
            
            {/* Quick Keyword Search */}
            <div className="relative w-full max-w-[170px] sm:max-w-xs">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="quick-search-input"
                type="text"
                placeholder="Cari film, aktor, genre..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>

            {/* AI Recommendation Button */}
            <button
              id="ai-recommend-btn"
              onClick={onOpenAiSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/25 to-rose-600/25 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0"
              title="Pencarian Kategori AI & Rekomendasi Pintar"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">Kurasi AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Dedicated Admin Portal Button */}
            {onOpenAdminLogin && (
              isAdmin ? (
                <button
                  id="nav-admin-badge-btn"
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                  title="Mode Admin Aktif - Kelola Bioskop & Google Drive"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Mode Admin</span>
                </button>
              ) : (
                <button
                  id="nav-admin-login-btn"
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-400 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer shrink-0"
                  title="Login Khusus Admin (Atur Google Drive & Film)"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              )
            )}

            {/* Offline Mode Indicator & Library */}
            <button
              id="open-offline-library-btn"
              onClick={onOpenOfflineLibrary}
              className="relative px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors shrink-0"
              title="Koleksi Unduhan Offline"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Download className="w-3.5 h-3.5 text-neutral-400" />}
              <span className="hidden md:inline">Offline</span>
              {offlineDownloadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] flex items-center justify-center">
                  {offlineDownloadCount}
                </span>
              )}
            </button>

            {/* Notification Center Trigger */}
            <button
              id="notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
              title="Notifikasi & Pengingat Serial"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-neutral-950 animate-pulse" />
              )}
            </button>

            {/* VIP Subscription CTA */}
            <button
              id="subscription-cta-btn"
              onClick={onOpenSubscription}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                vipStatus 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/25 hover:brightness-110'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{vipStatus ? 'VIP Ultra' : 'Langganan'}</span>
            </button>

            {/* User Profile Avatar */}
            <button
              id="profile-avatar-btn"
              onClick={onOpenProfile}
              className="relative rounded-full ring-2 ring-neutral-800 hover:ring-rose-500 transition-all overflow-hidden w-8 h-8 shrink-0"
              title="Profil Pengguna"
            >
              <img
                src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                alt={userProfile?.name || 'Profil'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>

        {/* Category Filter Chips Carousel */}
        <div className="border-t border-neutral-800/60 bg-neutral-950/60 py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 pr-1">
              Kategori:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 px-3 py-2 flex items-center justify-around">
        <button
          id="mobile-nav-home"
          onClick={() => {
            if (setActiveTab) setActiveTab('home');
            if (onSelectCategory) onSelectCategory('Semua');
            onSearchChange('');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
            activeCategory === 'Semua' && !searchQuery ? 'text-rose-500' : 'text-neutral-400'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        <button
          id="mobile-nav-ai"
          onClick={onOpenAiSearch}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-purple-400"
        >
          <Sparkles className="w-5 h-5" />
          <span>Cari AI</span>
        </button>

        <button
          id="mobile-nav-vip"
          onClick={onOpenSubscription}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-rose-400"
        >
          <Crown className="w-5 h-5" />
          <span>Langganan</span>
        </button>

        <button
          id="mobile-nav-offline"
          onClick={onOpenOfflineLibrary}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-amber-400 relative"
        >
          <Download className="w-5 h-5" />
          <span>Offline</span>
          {offlineDownloadCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-amber-500 text-neutral-950 text-[9px] font-bold rounded-full flex items-center justify-center">
              {offlineDownloadCount}
            </span>
          )}
        </button>

        {isAdmin ? (
          <button
            id="mobile-nav-admin"
            onClick={onOpenAdminLogin}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-amber-300"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Admin</span>
          </button>
        ) : (
          <button
            id="mobile-nav-profile"
            onClick={onOpenProfile}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-neutral-400"
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </button>
        )}
      </div>
    </>
  );
};
