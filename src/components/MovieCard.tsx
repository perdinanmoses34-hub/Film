import React from 'react';
import { Play, Plus, Check, Star, HardDrive, Crown, Download } from 'lucide-react';
import { Movie, WatchProgress } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  progress?: WatchProgress;
  onDownload: (movie: Movie) => void;
  isDownloaded: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
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
    <div 
      className="group relative flex-shrink-0 w-40 sm:w-48 md:w-56 cursor-pointer select-none"
      onClick={() => onOpenDetails(movie)}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md group-hover:border-neutral-700 transition-all duration-300">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {movie.isPremium ? (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-neutral-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-0.5 shadow">
              <Crown className="w-2.5 h-2.5" /> VIP
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-emerald-400 font-bold text-[10px] border border-neutral-700">
              GRATIS
            </span>
          )}

          <span className="px-1.5 py-0.5 rounded bg-neutral-900/80 backdrop-blur-md text-neutral-300 text-[10px] font-semibold border border-neutral-800 flex items-center gap-1">
            <HardDrive className="w-2.5 h-2.5 text-blue-400" />
            {movie.resolution === '4K UHD' ? '4K' : 'FHD'}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
          <div className="flex justify-end gap-1">
            <button
              id={`card-watchlist-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie);
              }}
              className={`p-1.5 rounded-full border text-xs transition-all ${
                isInWatchlist 
                  ? 'bg-rose-600 text-white border-rose-500' 
                  : 'bg-neutral-800/90 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
              title={isInWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              id={`card-download-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(movie);
              }}
              className={`p-1.5 rounded-full border text-xs transition-all ${
                isDownloaded
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-neutral-800/90 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
              title={isDownloaded ? 'Tersedia Offline' : 'Unduh Offline'}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 my-auto">
            <button
              id={`card-play-btn-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-110 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
            <span className="text-[11px] font-semibold text-white">
              {progress ? 'Lanjut Tonton' : 'Nonton Sekarang'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-400 text-center font-medium">
            {movie.genres.slice(0, 2).join(' • ')}
          </div>
        </div>

        {/* Bottom Progress Bar if watched */}
        {progress && progress.progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
            <div 
              className="h-full bg-rose-600"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Movie Information Footer */}
      <div className="mt-2 space-y-0.5">
        <h3 className="font-semibold text-xs sm:text-sm text-neutral-200 truncate group-hover:text-white transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-bold text-neutral-300">{movie.rating.toFixed(1)}</span>
          </div>
          <span>{movie.year}</span>
          <span className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px]">
            {movie.ageRating}
          </span>
        </div>
      </div>
    </div>
  );
};
