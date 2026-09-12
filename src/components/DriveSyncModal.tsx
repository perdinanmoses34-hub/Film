import React, { useState } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  FolderTree, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Play, 
  FolderPlus,
  Video,
  Layers,
  X,
  Copy,
  Check,
  Key,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle, isSuperAdmin } from '../lib/firebaseAuth';
import { scanDriveFolderCategories, DriveScanResult, convertDriveFileToMovie } from '../lib/driveSync';
import { Movie } from '../types';

interface DriveSyncModalProps {
  onClose: () => void;
  authUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onLogoutSuccess: () => void;
  onApplySyncedMovies: (movies: Movie[]) => void;
  currentFolderId?: string;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  onClose,
  authUser,
  accessToken,
  onAuthSuccess,
  onLogoutSuccess,
  onApplySyncedMovies,
  currentFolderId = '1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g',
}) => {
  const [folderInput, setFolderInput] = useState(currentFolderId);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DriveScanResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Unauthorized domain guidance state
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Manual token input state (alternative fallback)
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'perdinanmoses34-hub.github.io';
  const firebaseProjectId = 'gen-lang-client-0380774191';
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  // Extract folder ID if user pastes full URL
  const sanitizeFolderId = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('folders/')) {
      const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setUnauthorizedDomain(null);
    try {
      const res = await googleSignIn();
      if (res.unauthorizedDomain) {
        setUnauthorizedDomain(res.domain || currentHost);
        setErrorMessage(res.error || 'Domain belum diizinkan di Firebase Authentication Authorized Domains.');
        return;
      }
      if (res.canceled) {
        setStatusMessage(res.error || 'Jendela login ditutup.');
        return;
      }
      if (res.error) {
        if (res.error.includes('unauthorized-domain')) {
          setUnauthorizedDomain(currentHost);
        }
        setErrorMessage(res.error);
        return;
      }
      if (res.user && res.accessToken) {
        onAuthSuccess(res.user, res.accessToken);
        setStatusMessage(`Berhasil terhubung sebagai ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('unauthorized-domain')) {
        setUnauthorizedDomain(currentHost);
      }
      setErrorMessage(err.message || 'Gagal masuk dengan Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleApplyManualToken = () => {
    if (!manualToken.trim()) {
      setErrorMessage('Masukkan OAuth Access Token Google Drive yang valid.');
      return;
    }
    const dummyUser = {
      displayName: 'Google Drive Admin (Token)',
      email: 'admin-drive@custom-token.io',
      uid: 'token-user',
    } as unknown as User;

    onAuthSuccess(dummyUser, manualToken.trim());
    setStatusMessage('Access Token berhasil diterapkan! Sekarang Anda dapat memindai folder Drive.');
    setErrorMessage(null);
  };

  const handleLoadDemoCollection = () => {
    const demoResult: DriveScanResult = {
      rootFolderId: sanitizeFolderId(folderInput),
      rootFolderName: 'Cinema Google Drive (Koleksi Pilihan)',
      totalVideos: 6,
      categories: [
        {
          category: 'Action',
          folderId: 'folder-action-1',
          videoCount: 2,
          files: [
            { id: '1A98kXyZ0918', name: 'The.Raid.Redemption.1080p.mp4', mimeType: 'video/mp4', categoryFolder: 'Action' },
            { id: '1B87mWxY1029', name: 'John.Wick.Chapter.4.4K.mp4', mimeType: 'video/mp4', categoryFolder: 'Action' }
          ]
        },
        {
          category: 'Sci-Fi',
          folderId: 'folder-scifi-2',
          videoCount: 2,
          files: [
            { id: '1C76nVwX2130', name: 'Interstellar.IMAX.Enhanced.1080p.mp4', mimeType: 'video/mp4', categoryFolder: 'Sci-Fi' },
            { id: '1D65oUvW3241', name: 'Cyber.Nusantara.2088.UHD.mkv', mimeType: 'video/mp4', categoryFolder: 'Sci-Fi' }
          ]
        },
        {
          category: 'Horor',
          folderId: 'folder-horor-3',
          videoCount: 2,
          files: [
            { id: '1E54pTuV4352', name: 'Pengabdi.Setan.2.Communion.1080p.mp4', mimeType: 'video/mp4', categoryFolder: 'Horor' },
            { id: '1F43qStU5463', name: 'Misteri.Desa.Penari.FullHD.mp4', mimeType: 'video/mp4', categoryFolder: 'Horor' }
          ]
        }
      ],
      syncedMovies: [
        convertDriveFileToMovie({ id: '1A98kXyZ0918', name: 'The Raid Redemption (2011)', mimeType: 'video/mp4', categoryFolder: 'Action' }, 'Action'),
        convertDriveFileToMovie({ id: '1B87mWxY1029', name: 'John Wick: Chapter 4 (2023)', mimeType: 'video/mp4', categoryFolder: 'Action' }, 'Action'),
        convertDriveFileToMovie({ id: '1C76nVwX2130', name: 'Interstellar (2014)', mimeType: 'video/mp4', categoryFolder: 'Sci-Fi' }, 'Sci-Fi'),
        convertDriveFileToMovie({ id: '1D65oUvW3241', name: 'Cyber Nusantara 2088 (2025)', mimeType: 'video/mp4', categoryFolder: 'Sci-Fi' }, 'Sci-Fi'),
        convertDriveFileToMovie({ id: '1E54pTuV4352', name: 'Pengabdi Setan 2 (2022)', mimeType: 'video/mp4', categoryFolder: 'Horor' }, 'Horor'),
        convertDriveFileToMovie({ id: '1F43qStU5463', name: 'Misteri Desa Penari (2024)', mimeType: 'video/mp4', categoryFolder: 'Horor' }, 'Horor'),
      ]
    };

    setScanResult(demoResult);
    onApplySyncedMovies(demoResult.syncedMovies);
    setStatusMessage('Berhasil memuat 6 film contoh dengan struktur subfolder kategori (Action, Sci-Fi, Horor) ke katalog Anda!');
    setErrorMessage(null);
  };

  const handleScan = async () => {
    if (!accessToken) {
      setErrorMessage('Silakan masuk dengan akun Google terlebih dahulu untuk membaca folder Drive Anda.');
      return;
    }

    const folderId = sanitizeFolderId(folderInput);
    if (!folderId) {
      setErrorMessage('Masukkan Folder ID Google Drive yang valid.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setStatusMessage('Memindai struktur subfolder kategori & file video di Google Drive...');

    try {
      const result = await scanDriveFolderCategories(accessToken, folderId);
      setScanResult(result);

      if (result.syncedMovies.length > 0) {
        onApplySyncedMovies(result.syncedMovies);
        setStatusMessage(`Sukses! Ditemukan ${result.totalVideos} film dalam ${result.categories.length} kategori subfolder.`);
      } else {
        setStatusMessage('Folder terhubung dengan sukses. Namun belum ditemukan file video (.mp4, .mkv) di dalam subfolder atau folder utama.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Gagal membaca folder Google Drive. Pastikan tautan folder dapat diakses oleh akun Anda.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Koneksi Google Drive Cinema
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Drive API v3
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sinkronisasi otomatis katalog film berdasarkan subfolder kategori Drive Anda.
            </p>
          </div>
        </div>

        {/* Auth Section */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                <span>Status Akun Admin / Pengelola:</span>
                {authUser && isSuperAdmin(authUser) && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    ⭐ Super Admin
                  </span>
                )}
              </div>
              {authUser ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-400">{authUser.displayName || authUser.email}</span>
                  <span className="text-xs text-neutral-500">({authUser.email})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Belum terhubung. Masuk dengan akun Google Admin untuk membaca folder Drive Anda.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {authUser ? (
                <button
                  onClick={async () => {
                    await logoutGoogle();
                    onLogoutSuccess();
                    setScanResult(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Putuskan Akun
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-blue-600" />
                    {isSigningIn ? 'Membuka Login...' : 'Masuk dengan Google'}
                  </button>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka di tab baru jika browser memblokir pop-up pada iframe"
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Special Guidance: Unauthorized Domain Banner */}
        {unauthorizedDomain && (
          <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">
                  Domain Belum Diizinkan di Firebase Authentication
                </div>
                <p className="text-amber-300/90 leading-relaxed">
                  Firebase menolak login dari domain ini karena domain belum didaftarkan di daftar <strong>Authorized domains</strong> Firebase Console.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950/80 rounded-lg p-3 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-400">Domain yang harus ditambahkan:</span>
                <button
                  onClick={() => copyToClipboard(unauthorizedDomain)}
                  className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Domain</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-white bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800 select-all">
                {unauthorizedDomain}
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-neutral-300 pl-1">
              <div className="font-semibold text-white">Cara Mengaktifkan di Firebase Console (1 Menit):</div>
              <ol className="list-decimal pl-4 space-y-1 text-neutral-300">
                <li>
                  Buka Firebase Console:{' '}
                  <a
                    href={firebaseAuthSettingsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 underline inline-flex items-center gap-0.5 hover:text-amber-300 font-medium"
                  >
                    Buka Pengaturan Firebase Auth <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Pilih tab <strong>Settings</strong> &gt; menu <strong>Authorized domains</strong>.</li>
                <li>Klik tombol <strong>"Add domain"</strong> lalu tempelkan <code className="text-amber-300 font-mono bg-neutral-900 px-1 py-0.5 rounded">{unauthorizedDomain}</code>.</li>
                <li>Klik <strong>Save</strong>. Lalu kembali ke sini dan klik tombol <strong>"Masuk dengan Google"</strong> kembali.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Alternative Options (Manual Token & Demo) */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowManualToken(!showManualToken)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-neutral-700/60 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            {showManualToken ? 'Tutup Input Token' : 'Opsi Alternatif: Masukkan Token Manual'}
          </button>

          <button
            onClick={handleLoadDemoCollection}
            className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors border border-purple-500/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Muat Contoh Subfolder Drive (Uji Coba Langsung)
          </button>
        </div>

        {/* Manual Token Input Drawer */}
        {showManualToken && (
          <div className="mb-5 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>OAuth 2.0 Bearer Access Token Google Drive:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="ya29.a0AfH6SM..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleApplyManualToken}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                Gunakan Token
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Dapat diperoleh dari Google OAuth2 Playground atau Google Cloud Console.
            </p>
          </div>
        )}

        {/* Folder Input */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span>Tautan Folder Utama Google Drive Anda:</span>
            <a 
              href={`https://drive.google.com/drive/folders/${sanitizeFolderId(folderInput)}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              Buka di Google Drive <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g"
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              onClick={handleScan}
              disabled={isScanning || !accessToken}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Memindai...' : 'Sinkronkan Sekarang'}
            </button>
          </div>
        </div>

        {/* Guide / Info Card */}
        <div className="bg-neutral-950/50 rounded-xl p-3.5 border border-neutral-800/80 mb-5 text-xs text-neutral-400 space-y-2">
          <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-amber-400" />
            Panduan Pembagian Kategori Film di Google Drive:
          </div>
          <p className="leading-relaxed">
            Di dalam folder utama Anda, buat subfolder dengan nama kategori genre yang diinginkan. Contoh:
          </p>
          <div className="bg-neutral-900 p-2.5 rounded-lg font-mono text-[11px] text-neutral-300 space-y-1">
            <div>📁 <strong>Folder Utama</strong> (1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g)</div>
            <div className="pl-4">├── 📁 <strong>Action</strong> / 🎬 FilmAksi1.mp4, FilmAksi2.mkv</div>
            <div className="pl-4">├── 📁 <strong>Horor</strong> / 🎬 FilmHoror.mp4</div>
            <div className="pl-4">├── 📁 <strong>Sci-Fi</strong> / 🎬 FilmSciFi.mp4</div>
            <div className="pl-4">└── 📁 <strong>Drama</strong> / 🎬 FilmDrama.mp4</div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Aplikasi secara cerdas mengenali nama subfolder sebagai kategori/genre film di aplikasi, membersihkan nama file (seperti 1080p, x264), dan menyediakan pemutaran video langsung dengan Google Drive Video Player.
          </p>
        </div>

        {/* Status or Error Notifications */}
        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && !unauthorizedDomain && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scan Results breakdown if available */}
        {scanResult && scanResult.categories.length > 0 && (
          <div className="border border-neutral-800 rounded-xl overflow-hidden mb-4">
            <div className="bg-neutral-800/60 px-3.5 py-2 text-xs font-bold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Hasil Sinkronisasi Subfolder Kategori ({scanResult.categories.length} Kategori)
              </span>
              <span className="text-amber-400 font-semibold">{scanResult.totalVideos} Total Film</span>
            </div>
            <div className="p-3 max-h-52 overflow-y-auto space-y-2 bg-neutral-950/80 divide-y divide-neutral-850">
              {scanResult.categories.map((cat, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{cat.category}</span>
                      <span className="text-[11px] text-neutral-500 ml-2">({cat.videoCount} video ditemukan)</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Video className="w-3 h-3 text-neutral-500" />
                    {cat.files.length > 0 ? cat.files[0].name.slice(0, 24) + '...' : 'Belum ada video'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
          {scanResult && scanResult.syncedMovies.length > 0 && (
            <button
              onClick={() => {
                onApplySyncedMovies(scanResult.syncedMovies);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Terapkan ke Katalog & Nonton
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
