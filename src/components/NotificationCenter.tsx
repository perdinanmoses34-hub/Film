import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Film, 
  Sparkles, 
  Crown, 
  Calendar, 
  CheckCheck,
  Send,
  Radio
} from 'lucide-react';
import { NotificationItem, Movie } from '../types';

interface NotificationCenterProps {
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onPlayMovieById: (movieId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onClose,
  notifications,
  onMarkAllAsRead,
  onPlayMovieById,
}) => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        setPushEnabled(true);
        // Show test notification
        new Notification('CineDrive Stream Notifikasi Aktif', {
          body: 'Anda akan menerima pengingat instan untuk episode serial dan film terbaru dari watchlist Anda!',
          icon: '/public/assets/aistudio/icon.png',
        });
      }
    } else {
      setPushEnabled(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Pusat Notifikasi & Pengingat Serial
              </h3>
              <p className="text-xs text-neutral-400">
                Pemberitahuan rilis film baru dari watchlist & jadwal episode serial
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

        {/* Push Notification Permission Box */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h4 className="font-bold text-xs sm:text-sm text-white">Notifikasi Push Browser & Ponsel</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pushEnabled || permissionStatus === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {pushEnabled || permissionStatus === 'granted' ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>

            <p className="text-xs text-neutral-300">
              Dapatkan pengingat otomatis saat serial favorit rilis episode baru atau film di daftar tontonan siap streaming.
            </p>

            {!(pushEnabled || permissionStatus === 'granted') ? (
              <button
                onClick={requestPushPermission}
                className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Aktifkan Notifikasi Push
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Check className="w-4 h-4" />
                <span>Pengingat serial sedang diikuti aktif untuk hari Jumat pukul 20:00 WIB</span>
              </div>
            )}
          </div>

          {/* Action to Mark All Read */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-neutral-400">Pemberitahuan Terbaru:</span>
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          </div>

          {/* Notification Items List */}
          <div className="space-y-2.5">
            {notifications.map((notif) => {
              const icon = notif.type === 'series_reminder' ? (
                <Calendar className="w-4 h-4 text-purple-400" />
              ) : notif.type === 'release' ? (
                <Film className="w-4 h-4 text-rose-400" />
              ) : (
                <Crown className="w-4 h-4 text-amber-400" />
              );

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    notif.isRead
                      ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400'
                      : 'bg-neutral-950 border-neutral-700/80 text-white shadow-sm'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-white">{notif.title}</h5>
                      <span className="text-[10px] text-neutral-500">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.movieId && (
                      <button
                        onClick={() => {
                          onClose();
                          onPlayMovieById(notif.movieId!);
                        }}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline pt-1 inline-block"
                      >
                        Tonton Film Sekarang →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
