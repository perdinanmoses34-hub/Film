import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Prompt select account so user can easily choose their Google Account
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Designated Super Admin Email
export const SUPER_ADMIN_EMAIL = 'moni150388@gmail.com';

export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface SignInResult {
  user: User | null;
  accessToken: string | null;
  canceled?: boolean;
  error?: string;
}

// Sign in with Google Popup - with graceful handling of popup close & cancel
export const googleSignIn = async (): Promise<SignInResult> => {
  if (isSigningIn) {
    return { user: null, accessToken: null, error: 'Proses login sedang berjalan.' };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return { 
        user: result.user, 
        accessToken: null, 
        error: 'Login berhasil, namun izin akses Drive belum diberikan.' 
      };
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Gracefully handle common user cancellation without tripping console.error
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn('Google Sign-In popup was closed by user.');
      return { 
        user: null, 
        accessToken: null, 
        canceled: true, 
        error: 'Jendela login ditutup sebelum otorisasi selesai. Silakan klik "Masuk dengan Google" kembali jika ingin menyinkronkan folder.' 
      };
    }

    if (error.code === 'auth/popup-blocked') {
      console.warn('Google Sign-In popup was blocked by browser.');
      return { 
        user: null, 
        accessToken: null, 
        error: 'Popup browser diblokir. Harap izinkan pop-up untuk situs ini atau buka aplikasi di tab baru.' 
      };
    }

    if (error.code === 'auth/cancelled-popup-request') {
      console.warn('Previous popup request was replaced.');
      return { user: null, accessToken: null, canceled: true };
    }

    console.warn('Google Sign-In notice:', error.message || error);
    return { 
      user: null, 
      accessToken: null, 
      error: error.message || 'Terjadi kendala saat menghubungkan akun Google.' 
    };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
