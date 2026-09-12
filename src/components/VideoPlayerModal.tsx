import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  Settings, 
  HardDrive, 
  Share2, 
  Download, 
  Star, 
  Check, 
  Clock, 
  Smartphone, 
  ShieldAlert, 
  Layers, 
  Subtitles, 
  Sparkles,
  ExternalLink,
  Copy,
  Crown,
  Plus
} from 'lucide-react';
import { Movie, WatchProgress, UserProfile, UserReview } from '../types';
import { formatTime, saveMovieProgress } from '../utils/storage';
import { UserReviews } from './UserReviews';
import { SocialShareModal } from './SocialShareModal';

interface VideoPlayerModalProps {
  movie: Movie;
  onClose: () => void;
  userProfile: UserProfile;
  initialProgress?: WatchProgress;
  onUpdateProgress: (progress: WatchProgress) => void;
  onOpenSubscription: () => void;
  onDownload: (movie: Movie) => void;
  isDownloaded: boolean;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  reviews: UserReview[];
  onAddReview: (review: Partial<UserReview>) => void;
  onLikeReview: (reviewId: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  onClose,
  userProfile,
  initialProgress,
  onUpdateProgress,
  onOpenSubscription,
  onDownload,
  isDownloaded,
  isInWatchlist,
  onToggleWatchlist,
  reviews,
  onAddReview,
  onLikeReview,
}) => {
  // Player state
  const [playerMode, setPlayerMode] = useState<'cloud_html5' | 'drive_embed'>('cloud_html5');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState(movie.resolution);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('Bahasa Indonesia');
  const [showResumeBanner, setShowResumeBanner] = useState(Boolean(initialProgress && initialProgress.currentTime > 15));
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedDriveId, setCopiedDriveId] = useState(false);
  const [driveApiStatus, setDriveApiStatus] = useState<string>('Terhubung (Drive API v3)');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // VIP protection check
  const requiresVip = movie.isPremium && !userProfile.isVip;

  // Handle resume initial position
  const handleResume = () => {
    if (initialProgress && videoRef.current) {
      videoRef.current.currentTime = initialProgress.currentTime;
      setCurrentTime(initialProgress.currentTime);
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowResumeBanner(false);
  };

  const handleStartOver = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowResumeBanner(false);
  };

  // Video element listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgress && initialProgress.currentTime > 15 && !showResumeBanner) {
        video.currentTime = initialProgress.currentTime;
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [initialProgress, showResumeBanner]);

  // Periodic real-time sync (every 3 seconds of active playback)
  useEffect(() => {
    if (!isPlaying || duration === 0) return;

    const interval = setInterval(() => {
      const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100));
      const payload: WatchProgress = {
        movieId: movie.id,
        currentTime: Math.round(currentTime),
        duration: Math.round(duration),
        progressPercent,
        lastWatchedAt: new Date().toISOString(),
        deviceId: userProfile.currentDevice.id,
        deviceName: userProfile.currentDevice.name,
      };

      // Save locally
      saveMovieProgress(payload);
      onUpdateProgress(payload);

      // Sync with server in background
      fetch('/api/sync/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.warn('Sync server offline, local progress saved', err));

    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, movie.id, userProfile, onUpdateProgress]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Skip time
  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  };

  // Speed change
  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSpeedMenu(false);
  };

  const copyDriveId = () => {
    navigator.clipboard.writeText(movie.googleDriveFileId);
    setCopiedDriveId(true);
    setTimeout(() => setCopiedDriveId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md overflow-y-auto flex flex-col">
      
      {/* Top Player Bar */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="close-player-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {movie.title}
              </h2>
              {movie.isPremium && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  VIP
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>{movie.year}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{driveApiStatus}</span>
            </div>
          </div>
        </div>

        {/* Engine switcher & Share */}
        <div className="flex items-center gap-2">
          {/* Player Mode Switcher */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setPlayerMode('cloud_html5')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                playerMode === 'cloud_html5' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Cloud Stream
            </button>
            <button
              onClick={() => setPlayerMode('drive_embed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                playerMode === 'drive_embed' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Drive Embed
            </button>
          </div>

          <button
            id="share-movie-top-btn"
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Bagikan ke Media Sosial"
          >
            <Share2 className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Bagikan</span>
          </button>
        </div>
      </div>

      {/* Main Player Screen Area */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6">
        
        {/* VIP Lock Screen if required */}
        {requiresVip ? (
          <div className="aspect-video w-full rounded-2xl bg-neutral-900 border border-amber-500/30 flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
            <img
              src={movie.backdropUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 max-w-md space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Konten Eksklusif VIP Cinema
                </h3>
                <p className="text-sm text-neutral-300 mt-1">
                  Film "{movie.title}" hanya dapat diakses dengan langganan VIP Cinema Pass atau Ultra 4K. Nikmati pemutaran video Google Drive kecepatan tinggi tanpa batas.
                </p>
              </div>
              <button
                id="unlock-vip-btn"
                onClick={onOpenSubscription}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                Mulai Langganan VIP (Mulai Rp 49.000)
              </button>
            </div>
          </div>
        ) : (
          /* Active Video Player Container */
          <div 
            ref={containerRef}
            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl group select-none"
          >
            {playerMode === 'cloud_html5' ? (
              <>
                <video
                  ref={videoRef}
                  src={movie.trailerVideoUrl}
                  poster={movie.backdropUrl}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  playsInline
                />

                {/* Resume Playback Prompt Banner */}
                {showResumeBanner && initialProgress && (
                  <div className="absolute top-4 left-4 right-4 z-30 bg-neutral-900/95 border border-rose-500/40 backdrop-blur-md rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xl animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-xs sm:text-sm text-neutral-200">
                        Terakhir ditonton pada menit <strong>{formatTime(initialProgress.currentTime)}</strong> di {initialProgress.deviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id="resume-playback-btn"
                        onClick={handleResume}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                      >
                        Lanjutkan ({formatTime(initialProgress.currentTime)})
                      </button>
                      <button
                        id="start-over-btn"
                        onClick={handleStartOver}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                      >
                        Mulai Awal
                      </button>
                    </div>
                  </div>
                )}

                {/* Center Big Play Button when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 hover:scale-110 transition-all pointer-events-auto cursor-pointer"
                    >
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </button>
                  </div>
                )}

                {/* Bottom Custom Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity">
                  
                  {/* Progress Slider */}
                  <div className="w-full flex items-center gap-2 mb-2">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const newTime = Number(e.target.value);
                        setCurrentTime(newTime);
                        if (videoRef.current) videoRef.current.currentTime = newTime;
                      }}
                      className="w-full h-1.5 bg-neutral-700 accent-rose-600 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 hover:text-rose-400 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                      </button>

                      <button
                        onClick={() => skip(-10)}
                        className="p-1.5 text-neutral-300 hover:text-white"
                        title="Mundur 10 detik"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => skip(10)}
                        className="p-1.5 text-neutral-300 hover:text-white"
                        title="Maju 10 detik"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.muted = !isMuted;
                              setIsMuted(!isMuted);
                            }
                          }}
                          className="p-1 hover:text-rose-400"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setVolume(v);
                            setIsMuted(false);
                            if (videoRef.current) {
                              videoRef.current.volume = v;
                              videoRef.current.muted = false;
                            }
                          }}
                          className="w-14 sm:w-20 h-1 accent-rose-500 bg-neutral-700 rounded cursor-pointer"
                        />
                      </div>

                      {/* Time display */}
                      <span className="text-neutral-400 text-xs font-mono hidden sm:inline">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Playback speed selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-2 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-xs font-semibold"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1 shadow-xl flex flex-col gap-1 min-w-[70px]">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => changeSpeed(s)}
                                className={`px-2 py-1 text-xs text-left rounded ${
                                  playbackSpeed === s ? 'bg-rose-600 text-white' : 'hover:bg-neutral-800 text-neutral-300'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quality label */}
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[11px] font-bold text-neutral-300 border border-neutral-700 hidden sm:inline">
                        {selectedQuality}
                      </span>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 text-neutral-300 hover:text-white"
                        title="Layar Penuh"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Google Drive Native Embed Preview */
              <div className="w-full h-full relative">
                <iframe
                  src={movie.streamEmbedUrl || `https://drive.google.com/file/d/${movie.googleDriveFileId}/preview`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  title={movie.title}
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-xs text-neutral-300 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Drive Native Embed</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Information & Action Shelf */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Details, Google Drive API Info, Synoposis */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="toggle-watchlist-modal-btn"
                onClick={() => onToggleWatchlist(movie)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-colors ${
                  isInWatchlist
                    ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isInWatchlist ? 'Ada di Watchlist' : 'Tambah Watchlist'}</span>
              </button>

              <button
                id="download-offline-modal-btn"
                onClick={() => onDownload(movie)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-colors ${
                  isDownloaded
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isDownloaded ? 'Tersedia Offline' : 'Unduh Offline'}</span>
              </button>

              <button
                id="share-modal-btn"
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-rose-400" />
                <span>Bagikan Ulasan</span>
              </button>
            </div>

            {/* Google Drive Storage Metadata Card */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Google Drive API Video Database</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Status: Siap Streaming
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
                <div className="flex items-center gap-1 font-mono text-[11px] bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                  <span>File ID: {movie.googleDriveFileId}</span>
                  <button 
                    onClick={copyDriveId}
                    className="p-1 hover:text-white text-neutral-400" 
                    title="Salin Google Drive File ID"
                  >
                    {copiedDriveId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span>Resolusi: {movie.resolution} • Audio: {movie.audio[0]}</span>
              </div>
            </div>

            {/* Synopsis & Cast */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Sinopsis</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {movie.synopsis}
              </p>
              <div className="pt-2 text-xs text-neutral-400 space-y-1">
                <p><strong>Sutradara:</strong> {movie.director}</p>
                <p><strong>Pemeran:</strong> {movie.cast.join(', ')}</p>
                <p><strong>Subtitle:</strong> {movie.subtitles.join(', ')}</p>
              </div>
            </div>

            {/* Community Reviews Section */}
            <div className="pt-4 border-t border-neutral-800">
              <UserReviews
                movieId={movie.id}
                movieTitle={movie.title}
                reviews={reviews}
                onAddReview={onAddReview}
                onLikeReview={onLikeReview}
                onOpenShare={() => setShowShareModal(true)}
              />
            </div>
          </div>

          {/* Right Col: Real-time Device Sync Info & Series Info */}
          <div className="space-y-4">
            {/* Real-time Device Synchronization Widget */}
            <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                  Sinkronisasi Real-Time
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-neutral-300">
                Progres tontonan Anda disimpan secara otomatis ke server CineDrive dan disinkronkan ke seluruh perangkat Anda.
              </p>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Perangkat Aktif:</span>
                  <span className="text-white font-medium">{userProfile.currentDevice.name}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Status Sync:</span>
                  <span className="text-emerald-400 font-medium">Tersinkronisasi</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Posisi Saat Ini:</span>
                  <span className="font-mono text-neutral-200">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* Series Reminder Info if applicable */}
            {movie.isSeries && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Serial Sedang Berjalan</span>
                </div>
                <p className="text-xs text-neutral-300">
                  {movie.latestEpisode}
                </p>
                {movie.nextEpisodeReleaseDate && (
                  <p className="text-[11px] text-purple-200 font-medium bg-purple-900/40 p-2 rounded border border-purple-700/50">
                    📅 Rilis Berikutnya: {movie.nextEpisodeReleaseDate}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <SocialShareModal
          movie={movie}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
