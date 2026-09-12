import React from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Play, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { OfflineDownload, Movie } from '../types';
import { formatBytes } from '../utils/storage';

interface OfflineLibraryProps {
  onClose: () => void;
  downloads: OfflineDownload[];
  onPlayOffline: (movie: Movie) => void;
  onDeleteDownload: (movieId: string) => void;
  onClearAll: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  movies: Movie[];
}

export const OfflineLibrary: React.FC<OfflineLibraryProps> = ({
  onClose,
  downloads,
  onPlayOffline,
  onDeleteDownload,
  onClearAll,
  isOfflineMode,
  onToggleOfflineMode,
  movies,
}) => {
  const totalStorageBytes = downloads.reduce((acc, d) => acc + d.sizeBytes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Koleksi Nonton Offline
              </h3>
              <p className="text-xs text-neutral-400">
                Putar video Google Drive kapan saja tanpa koneksi internet
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

        {/* Status Bar: Network Mode & Storage Usage */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Airplane Mode / Offline Simulator Card */}
          <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isOfflineMode 
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
              : 'bg-neutral-950 border-neutral-800 text-neutral-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isOfflineMode ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-emerald-400'}`}>
                {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  {isOfflineMode ? 'Mode Offline Aktif (Simulasi Tanpa Sinyal)' : 'Koneksi Online Normal'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {isOfflineMode 
                    ? 'Aplikasi hanya memutar konten dari penyimpanan lokal Anda' 
                    : 'Uji pemutaran tanpa koneksi internet (mode pesawat)'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleOfflineMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                isOfflineMode
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              {isOfflineMode ? 'Matikan Mode Offline' : 'Aktifkan Mode Pesawat'}
            </button>
          </div>

          {/* Storage Meter */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-400">Penggunaan Penyimpanan Offline:</span>
              <span className="font-bold text-white">{formatBytes(totalStorageBytes)}</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                style={{ width: `${Math.min(100, (totalStorageBytes / (10 * 1024 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{downloads.length} Film tersimpan di perangkat</span>
              <span>Kapasitas penyimpanan lokal: ~10 GB</span>
            </div>
          </div>

          {/* Downloads List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Daftar Film Siap Tonton Offline</h4>
              {downloads.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>

            {downloads.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
                <h5 className="font-bold text-sm text-neutral-300">Belum Ada Film yang Diunduh</h5>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Klik ikon unduh pada film favorit Anda untuk menyimpannya di perangkat dan menonton kapan saja saat bepergian atau tanpa kuota.
                </p>
              </div>
            ) : (
              downloads.map((item) => {
                const movie = movies.find(m => m.id === item.movieId);

                return (
                  <div
                    key={item.movieId}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.posterUrl}
                        alt={item.movieTitle}
                        className="w-12 h-16 object-cover rounded-lg shrink-0 border border-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white truncate max-w-xs">{item.movieTitle}</h5>
                          <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                            {item.quality}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 flex items-center gap-2">
                          <span>{formatBytes(item.sizeBytes)}</span>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Siap Diputar
                          </span>
                        </p>
                        <p className="text-[10px] text-neutral-500">Diunduh: {item.downloadedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onDeleteDownload(item.movieId)}
                        className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Hapus dari Penyimpanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (movie) {
                            onClose();
                            onPlayOffline(movie);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/25"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Putar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
