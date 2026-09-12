import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, WatchProgress, OfflineDownload } from '../types';
import { MovieCard } from './MovieCard';

export interface MovieRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies?: Movie[];
  onPlayMovie?: (movie: Movie) => void;
  onPlay?: (movie: Movie) => void;
  onOpenDetails?: (movie: Movie) => void;
  onOpenShare?: (movie: Movie) => void;
  watchlist?: string[];
  onToggleWatchlist?: (movie: Movie) => void;
  progressMap?: Record<string, WatchProgress>;
  onDownloadMovie?: (movie: Movie) => void;
  onDownload?: (movie: Movie) => void;
  downloadedMovieIds?: string[];
  downloads?: OfflineDownload[];
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  icon,
  movies = [],
  onPlay,
  onPlayMovie,
  onOpenDetails,
  onOpenShare,
  watchlist = [],
  onToggleWatchlist = () => {},
  progressMap = {},
  onDownload,
  onDownloadMovie,
  downloadedMovieIds,
  downloads = [],
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const safePlay = onPlayMovie || onPlay || (() => {});
  const safeDetails = onOpenDetails || onOpenShare || safePlay;
  const safeDownload = onDownloadMovie || onDownload || (() => {});
  const safeWatchlist = watchlist || [];
  const safeProgressMap = progressMap || {};
  
  // Resolve downloaded IDs safely from either downloadedMovieIds or downloads array
  const safeDownloadedIds: string[] = downloadedMovieIds 
    ? downloadedMovieIds 
    : (downloads || []).map(d => d.movieId);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative py-4 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Header */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Arrow navigation buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrolling Cards Container */}
        <div
          ref={rowRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={safePlay}
              onOpenDetails={safeDetails}
              isInWatchlist={safeWatchlist.includes(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
              progress={safeProgressMap[movie.id]}
              onDownload={safeDownload}
              isDownloaded={safeDownloadedIds.includes(movie.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
