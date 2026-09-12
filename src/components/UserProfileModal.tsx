import React, { useState } from 'react';
import { 
  X, 
  User, 
  Crown, 
  Smartphone, 
  Tv, 
  Laptop, 
  Tablet, 
  Clock, 
  Trash2, 
  Play, 
  Bookmark, 
  History, 
  Bell, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, Movie, WatchProgress } from '../types';
import { formatTime } from '../utils/storage';

interface UserProfileModalProps {
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  movies: Movie[];
  watchlist: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  progressMap: Record<string, WatchProgress>;
  onClearHistory: () => void;
  onOpenSubscription: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  userProfile,
  onUpdateProfile,
  movies,
  watchlist,
  onToggleWatchlist,
  onPlayMovie,
  progressMap,
  onClearHistory,
  onOpenSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history' | 'devices'>('watchlist');

  const watchlistMovies = (movies || []).filter(m => (watchlist || []).includes(m.id));
  const historyMovies = (movies || []).filter(m => progressMap && progressMap[m.id]);

  const availableDevices = [
    { id: 'dev-web-01', name: 'Browser Ini (Aktif)', type: 'desktop' as const, icon: <Laptop className="w-4 h-4" /> },
    { id: 'dev-phone-02', name: 'iPhone 15 Pro Max', type: 'mobile' as const, icon: <Smartphone className="w-4 h-4" /> },
    { id: 'dev-tv-03', name: 'Living Room Smart TV 4K', type: 'tv' as const, icon: <Tv className="w-4 h-4" /> },
    { id: 'dev-tab-04', name: 'Samsung Galaxy Tab S9', type: 'tablet' as const, icon: <Tablet className="w-4 h-4" /> },
  ];

  const handleSelectDevice = (dev: typeof availableDevices[0]) => {
    onUpdateProfile({
      ...userProfile,
      currentDevice: {
        id: dev.id,
        name: dev.name,
        type: dev.type,
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header with Profile Info */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-rose-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  {userProfile.name}
                </h3>
                {userProfile.isVip ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow">
                    <Crown className="w-3 h-3" /> VIP Ultra
                  </span>
                ) : (
                  <button
                    onClick={onOpenSubscription}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
                  >
                    Upgrade VIP
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {userProfile.email} • Aktif di {userProfile.currentDevice.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span>Daftar Tontonan ({watchlistMovies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Riwayat ({historyMovies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'devices'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Sinkronisasi Perangkat</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: WATCHLIST */}
          {activeTab === 'watchlist' && (
            <div className="space-y-3">
              {watchlistMovies.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Daftar tontonan Anda masih kosong. Jelajahi katalog dan simpan film untuk ditonton nanti!
                </div>
              ) : (
                watchlistMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-lg shrink-0 border border-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-white">{movie.title}</h4>
                        <p className="text-xs text-neutral-400">
                          {movie.year} • {movie.genres.join(', ')} • Rating: ⭐ {movie.rating.toFixed(1)}
                        </p>
                        <p className="text-[11px] text-neutral-500">{movie.director}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleWatchlist(movie)}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Hapus dari Daftar Tontonan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onPlayMovie(movie);
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/25"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Tonton</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                {historyMovies.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Riwayat</span>
                  </button>
                )}
              </div>

              {historyMovies.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Belum ada riwayat tontonan tersimpan.
                </div>
              ) : (
                historyMovies.map((movie) => {
                  const prog = progressMap[movie.id];

                  return (
                    <div
                      key={movie.id}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0 border border-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white">{movie.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span className="font-mono text-neutral-200">
                              {formatTime(prog.currentTime)} / {formatTime(prog.duration)} ({prog.progressPercent}%)
                            </span>
                            <span>•</span>
                            <span className="text-[11px] text-neutral-500">{prog.deviceName}</span>
                          </div>
                          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600 rounded-full" style={{ width: `${prog.progressPercent}%` }} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onPlayMovie(movie);
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/25 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Lanjutkan</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: DEVICES & SYNC */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Pilih Perangkat Aktif untuk Sinkronisasi Real-Time
                </h4>
                <p className="text-xs text-neutral-400">
                  Perpindahan antar perangkat akan secara otomatis melanjutkan film dari titik detik terakhir Anda menonton.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDevices.map((dev) => {
                  const isCurrent = userProfile.currentDevice.id === dev.id;

                  return (
                    <div
                      key={dev.id}
                      onClick={() => handleSelectDevice(dev)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-neutral-950 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-900 text-neutral-400'}`}>
                          {dev.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-white">{dev.name}</h5>
                          <span className="text-[10px] text-neutral-400 font-mono">ID: {dev.id}</span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <button className="text-xs text-neutral-400 hover:text-white">
                          Pilih
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
