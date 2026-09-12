import React from 'react';
import { Play, Plus, Check, Star, Sparkles, HardDrive, Info, Download, Crown } from 'lucide-react';
import { Movie, WatchProgress } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  progress?: WatchProgress;
  onDownload: (movie: Movie) => void;
  isDownloaded: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
  progress,
  onDownload,
  isDownloaded
}) => {
  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden select-none">
      {/* Background Backdrop with Cinema Gradients */}
      <img
        src={movie.backdropUrl}
        alt={movie.title}
        className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent w-full md:w-3/4" />

      {/* Content Container */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Rekomendasi Utama
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-300 font-semibold text-xs border border-neutral-700/60 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-blue-400" /> Google Drive 4K
            </span>
            {movie.isPremium && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Premium VIP
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-xs font-bold border border-neutral-700">
              {movie.ageRating}
            </span>
            <span className="text-xs text-neutral-400 font-medium">{movie.year}</span>
            <span className="text-xs text-neutral-400 font-medium">{movie.durationMinutes} Menit</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
            {movie.title}
          </h1>

          {/* Rating and Genres */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
            <span className="text-neutral-500">•</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {movie.genres.map((g) => (
                <span key={g} className="text-xs text-neutral-300 font-medium bg-neutral-800/70 px-2 py-0.5 rounded-md">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed drop-shadow">
            {movie.synopsis}
          </p>

          {/* Progress bar if user previously watched */}
          {progress && progress.progressPercent > 2 && (
            <div className="w-full max-w-md pt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span>Lanjutkan tontonan ({progress.progressPercent}%)</span>
                <span>Tersinkronisasi {progress.deviceName}</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-600 rounded-full transition-all"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-play-btn"
              onClick={() => onPlay(movie)}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{progress && progress.currentTime > 10 ? 'Lanjutkan Menonton' : 'Tonton Sekarang'}</span>
            </button>

            <button
              id="hero-details-btn"
              onClick={() => onOpenDetails(movie)}
              className="px-4 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm flex items-center gap-2 border border-neutral-700 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Info className="w-4 h-4" />
              <span>Detail & Ulasan</span>
            </button>

            <button
              id="hero-watchlist-btn"
              onClick={() => onToggleWatchlist(movie)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isInWatchlist
                  ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700'
              }`}
              title={isInWatchlist ? 'Hapus dari Daftar Tontonan' : 'Tambah ke Daftar Tontonan'}
            >
              {isInWatchlist ? <Check className="w-5 h-5 text-rose-400" /> : <Plus className="w-5 h-5" />}
            </button>

            <button
              id="hero-download-btn"
              onClick={() => onDownload(movie)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isDownloaded
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700'
              }`}
              title={isDownloaded ? 'Tersedia di Mode Offline' : 'Unduh untuk Ditonton Offline'}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
