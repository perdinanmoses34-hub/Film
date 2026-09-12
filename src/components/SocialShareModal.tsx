import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send, Twitter, Share2 } from 'lucide-react';
import { Movie } from '../types';

interface SocialShareModalProps {
  movie: Movie;
  onClose: () => void;
  customReviewText?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  movie,
  onClose,
  customReviewText,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.origin + `?movie=${movie.id}`;
  const shareMessage = customReviewText
    ? `🎬 Saya baru saja mengulas "${movie.title}" (${movie.rating}/10) di CineDrive Stream:\n\n"${customReviewText}"\n\nNonton filmnya di Google Drive Player: ${shareUrl}`
    : `🍿 Nonton film "${movie.title}" (${movie.year}) di CineDrive Stream! Kualitas 4K UHD via Google Drive API: ${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Ulasan Film: ${movie.title} (${movie.rating}/10)`)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-white text-base">Bagikan Ulasan & Rekomendasi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Movie preview card */}
        <div className="flex gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-16 h-22 object-cover rounded-lg shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1 overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate">{movie.title}</h4>
            <p className="text-xs text-neutral-400">Rating: ⭐ {movie.rating.toFixed(1)}/10 • {movie.genres.join(', ')}</p>
            <p className="text-[11px] text-neutral-500 line-clamp-2">{movie.synopsis}</p>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* WhatsApp */}
          <button
            id="share-whatsapp-btn"
            onClick={shareToWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 text-emerald-400 transition-colors gap-1.5"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </button>

          {/* X / Twitter */}
          <button
            id="share-twitter-btn"
            onClick={shareToTwitter}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-white transition-colors gap-1.5"
          >
            <Twitter className="w-6 h-6 text-sky-400" />
            <span className="text-xs font-semibold">X (Twitter)</span>
          </button>

          {/* Telegram */}
          <button
            id="share-telegram-btn"
            onClick={shareToTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 hover:bg-sky-900/50 text-sky-400 transition-colors gap-1.5"
          >
            <Send className="w-6 h-6" />
            <span className="text-xs font-semibold">Telegram</span>
          </button>
        </div>

        {/* Copy Link input */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-400 font-medium">Tautan Langsung Film:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none"
            />
            <button
              id="copy-share-link-btn"
              onClick={copyToClipboard}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
