import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, AlertTriangle, Share2, Send } from 'lucide-react';
import { UserReview } from '../types';

interface UserReviewsProps {
  movieId: string;
  movieTitle: string;
  reviews: UserReview[];
  onAddReview: (review: Partial<UserReview>) => void;
  onLikeReview: (reviewId: string) => void;
  onOpenShare: () => void;
}

export const UserReviews: React.FC<UserReviewsProps> = ({
  movieId,
  movieTitle,
  reviews,
  onAddReview,
  onLikeReview,
  onOpenShare,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const movieReviews = (reviews || []).filter((r) => r.movieId === movieId);
  const avgRating = movieReviews.length > 0
    ? (movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length).toFixed(1)
    : '4.8';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onAddReview({
      movieId,
      rating,
      comment: comment.trim(),
      hasSpoiler,
      userName: 'Anda (Penonton)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      date: 'Baru saja',
      likesCount: 0,
    });

    setComment('');
    setHasSpoiler(false);
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Reviews Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Ulasan Pengguna</h3>
            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-xs font-semibold">
              {movieReviews.length} Ulasan
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Pendapat komunitas penonton tentang "{movieTitle}"
          </p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <span className="font-extrabold text-lg text-white">{avgRating}</span>
          </div>
          <span className="text-xs text-neutral-400">Rata-rata Komunitas</span>
        </div>
      </div>

      {/* Review Input Box */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300">Beri Nilai & Tulis Ulasan:</span>
          
          {/* Star selector */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber-400' : 'text-neutral-600'}`} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pendapat Anda tentang alur cerita, akting, atau pengalaman pemutaran..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSpoiler}
              onChange={(e) => setHasSpoiler(e.target.checked)}
              className="rounded accent-rose-600"
            />
            <span>Mengandung Bocoran Cerita (Spoiler)</span>
          </label>

          <button
            type="submit"
            disabled={!comment.trim()}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Ulasan</span>
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-3">
        {movieReviews.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs">
            Belum ada ulasan untuk film ini. Jadilah yang pertama memberikan ulasan!
          </div>
        ) : (
          movieReviews.map((rev) => {
            const isSpoilerHidden = rev.hasSpoiler && !revealedSpoilers[rev.id];

            return (
              <div key={rev.id} className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">{rev.userName}</span>
                        {rev.hasSpoiler && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Spoiler
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">{rev.date}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <div className="relative">
                  {isSpoilerHidden ? (
                    <div className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800 text-center space-y-1">
                      <p className="text-xs text-neutral-400">
                        Ulasan ini ditandai mengandung spoiler cerita.
                      </p>
                      <button
                        onClick={() => toggleSpoiler(rev.id)}
                        className="text-xs text-rose-400 font-semibold hover:underline"
                      >
                        Buka Ulasan
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  )}
                </div>

                {/* Footer Likes and Share */}
                <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
                  <button
                    onClick={() => onLikeReview(rev.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${rev.isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                    <span>Membantu ({rev.likesCount})</span>
                  </button>

                  <button
                    onClick={onOpenShare}
                    className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                    title="Bagikan ulasan ini"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
