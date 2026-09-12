import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  Key, 
  Check, 
  AlertCircle, 
  HardDrive, 
  Film, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, isSuperAdmin, logoutGoogle, SUPER_ADMIN_EMAIL } from '../lib/firebaseAuth';

interface AdminLoginModalProps {
  onClose: () => void;
  isAdmin: boolean;
  adminUser: User | null;
  onAdminLoginSuccess: (user?: User) => void;
  onAdminLogout: () => void;
  onOpenAdminPanel: () => void;
  onOpenDriveSync: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  isAdmin,
  adminUser,
  onAdminLoginSuccess,
  onAdminLogout,
  onOpenAdminPanel,
  onOpenDriveSync,
}) => {
  const [accessPin, setAccessPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Handle Google OAuth Sign-in specifically for Admin
  const handleGoogleAdminLogin = async () => {
    setIsLoggingIn(true);
    setGoogleError(null);
    setPinError(null);
    try {
      const res = await googleSignIn();
      if (res.canceled) {
        setGoogleError('Login dibatalkan oleh pengguna.');
        return;
      }
      if (res.unauthorizedDomain) {
        setGoogleError(`Domain belum diizinkan di Firebase: ${res.domain}. Anda juga dapat menggunakan Kunci Akses Admin di bawah.`);
        return;
      }
      if (res.error) {
        setGoogleError(res.error);
        return;
      }
      if (res.user) {
        if (isSuperAdmin(res.user) || (res.user.email && res.user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
          onAdminLoginSuccess(res.user);
          onClose();
        } else {
          setGoogleError(
            `Email "${res.user.email}" bukan akun admin terdaftar. Harap gunakan email: ${SUPER_ADMIN_EMAIL}`
          );
        }
      }
    } catch (err: any) {
      setGoogleError(err?.message || 'Gagal melakukan login admin dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Quick PIN / Master Key
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setGoogleError(null);

    const validPins = ['admin123', 'cinedrive2026', 'perdinan34', 'superadmin'];
    const entered = accessPin.trim().toLowerCase();

    if (validPins.includes(entered)) {
      onAdminLoginSuccess();
      onClose();
    } else {
      setPinError('Kunci akses atau PIN admin tidak valid. Silakan periksa kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-neutral-950" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Portal Khusus Admin
              {isAdmin && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Aktif
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400">
              Pengelolaan Google Drive, katalog film, dan setelan sistem
            </p>
          </div>
        </div>

        {/* IF ALREADY LOGGED IN AS ADMIN */}
        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Status Otorisasi:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/40">
                  ⭐ Super Administrator
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Akun Terdaftar:</span>
                <span className="font-mono text-white text-[11px] select-all">
                  {adminUser?.email || SUPER_ADMIN_EMAIL}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>Buka Pengaturan Film & Katalog</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenDriveSync();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <HardDrive className="w-4 h-4" />
                <span>Atur Sinkronisasi Google Drive</span>
              </button>

              <button
                onClick={() => {
                  onAdminLogout();
                  logoutGoogle();
                  onClose();
                }}
                className="w-full py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                <span>Keluar dari Mode Admin</span>
              </button>
            </div>
          </div>
        ) : (
          /* IF NOT LOGGED IN AS ADMIN */
          <div className="space-y-4">
            
            {/* Info Box */}
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
              Panel ini khusus diperuntukkan bagi pengelola bioskop. Pengguna biasa hanya memiliki akses untuk menonton dan berlangganan.
              <div className="mt-1.5 text-amber-400 font-semibold flex items-center gap-1.5">
                <span>Email Admin Resmi:</span>
                <code className="text-white font-mono bg-neutral-900 px-1.5 py-0.5 rounded text-[11px] select-all">
                  {SUPER_ADMIN_EMAIL}
                </code>
              </div>
            </div>

            {/* Option 1: Login via Google Admin */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Opsi 1: Masuk dengan Akun Google Admin
              </label>
              <button
                onClick={handleGoogleAdminLogin}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>{isLoggingIn ? 'Memproses Otorisasi...' : 'Masuk dengan Google (Super Admin)'}</span>
              </button>
              {googleError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{googleError}</span>
                </div>
              )}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-800" />
              <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                atau gunakan PIN
              </span>
              <div className="flex-grow border-t border-neutral-800" />
            </div>

            {/* Option 2: Quick Access Key / PIN */}
            <form onSubmit={handlePinSubmit} className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Opsi 2: Kunci Akses Pengelola</span>
                <span className="text-[10px] font-normal text-neutral-500">Akses cepat</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Masukkan PIN admin (misal: admin123)"
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shrink-0 transition-colors cursor-pointer"
                >
                  Buka
                </button>
              </div>
              {pinError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
