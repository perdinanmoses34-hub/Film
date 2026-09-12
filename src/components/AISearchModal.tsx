import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  Play, 
  Star, 
  Loader2, 
  HardDrive, 
  Plus, 
  Check, 
  Compass, 
  Heart, 
  Flame, 
  Moon, 
  Coffee 
} from 'lucide-react';
import { Movie } from '../types';

interface AISearchModalProps {
  onClose: () => void;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  watchlist: string[];
  onToggleWatchlist: (movie: Movie) => void;
}

interface AIRecommendationResult {
  movieId: string;
  movieTitle: string;
  matchScore: number;
  aiReason: string;
  atmosphereTags: string[];
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  onClose,
  movies,
  onPlayMovie,
  watchlist,
  onToggleWatchlist,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const presetQueries = [
    { text: 'Film fiksi ilmiah luar angkasa dengan plot mendalam', icon: <Compass className="w-3.5 h-3.5" /> },
    { text: 'Horor misteri desa terpencil suasana mencekam', icon: <Moon className="w-3.5 h-3.5" /> },
    { text: 'Kisah cinta hangat bernuansa hujan yang menenangkan', icon: <Coffee className="w-3.5 h-3.5" /> },
    { text: 'Aksi silat intens dengan ketegangan tinggi di ibukota', icon: <Flame className="w-3.5 h-3.5" /> },
    { text: 'Petualangan animasi ramah keluarga yang menginspirasi', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  const handleSearch = async (searchPrompt?: string) => {
    const textToSearch = searchPrompt || query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAiSummary(json.data.summary || 'Berikut rekomendasi film yang disesuaikan oleh kurasi AI:');
        setRecommendations(json.data.recommendations || []);
      }
    } catch (err) {
      console.error('AI search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Pencarian Kategori AI & Rekomendasi
              </h3>
              <p className="text-xs text-neutral-400">
                Bertenaga Gemini 3.8 Flash • Menemukan film berdasarkan mood, cerita, & tema spesifik
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

        {/* Search Input Area */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative"
          >
            <Search className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik suasana film yang Anda inginkan (misal: film horor psikologis, sci-fi time travel...)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-24 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:brightness-110 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1 transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Analisis AI</span>
            </button>
          </form>

          {/* Quick Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Inspirasi Mood Menonton:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetQueries.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(p.text);
                    handleSearch(p.text);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-all text-left"
                >
                  {p.icon}
                  <span>{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Area */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-xs text-neutral-300 font-medium">
                Gemini AI sedang menganalisis katalog film dan menyesuaikan suasana tontonan...
              </p>
            </div>
          )}

          {!loading && hasSearched && (
            <div className="space-y-4 pt-2">
              {aiSummary && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{aiSummary}</p>
                </div>
              )}

              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const movie = (movies || []).find(m => m.id === rec.movieId) || (movies || []).find(m => (m.title || '').toLowerCase().includes((rec.movieTitle || '').toLowerCase()));
                  if (!movie) return null;

                  const inWatchlist = (watchlist || []).includes(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 border border-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{movie.title}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                              {rec.matchScore}% Cocok
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                            </div>
                            <span>•</span>
                            <span>{movie.year}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-blue-400">
                              <HardDrive className="w-3 h-3" /> Drive {movie.resolution}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300 italic">
                            "{rec.aiReason}"
                          </p>

                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {rec.atmosphereTags.map((tag, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => onToggleWatchlist(movie)}
                          className={`p-2 rounded-lg border text-xs transition-colors ${
                            inWatchlist
                              ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                          title={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                        >
                          {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
