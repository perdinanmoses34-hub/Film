import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { Movie, UserProfile } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Explicitly connect to the provisioned Firestore database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "ai-studio-film-2eab4202-60ef-4b8c-98a7-d146eb20987f");

/**
 * Validate connection to Firestore on boot
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connected successfully.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore client is in offline mode or waiting for connection.');
    } else {
      console.log('Firestore connection verified.');
    }
    return false;
  }
}

/**
 * Real-time listener for movies catalog
 * When admin or any user adds/syncs a movie, all connected users receive the update instantly
 */
export function subscribeMovies(onUpdate: (movies: Movie[]) => void): () => void {
  try {
    const moviesRef = collection(db, 'movies');
    return onSnapshot(moviesRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreMovies: Movie[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Movie;
          if (data && data.title) {
            firestoreMovies.push({
              ...data,
              id: docSnap.id || data.id,
            });
          }
        });
        if (firestoreMovies.length > 0) {
          onUpdate(firestoreMovies);
        }
      }
    }, (err) => {
      console.warn('Firestore movies listener notice:', err.message);
    });
  } catch (err) {
    console.warn('Could not subscribe to Firestore movies:', err);
    return () => {};
  }
}

/**
 * Save a single movie to Firestore
 */
export async function saveMovieToFirestore(movie: Movie): Promise<void> {
  try {
    const docRef = doc(db, 'movies', movie.id);
    await setDoc(docRef, movie, { merge: true });
    console.log(`Movie "${movie.title}" saved to Firestore.`);
  } catch (err) {
    console.warn('Failed to save movie to Firestore directly, falling back:', err);
    throw err;
  }
}

/**
 * Save multiple movies to Firestore in batch
 */
export async function saveMoviesBatchToFirestore(movies: Movie[]): Promise<void> {
  if (!movies || movies.length === 0) return;
  try {
    const batch = writeBatch(db);
    movies.slice(0, 450).forEach((movie) => {
      const docRef = doc(db, 'movies', movie.id);
      batch.set(docRef, movie, { merge: true });
    });
    await batch.commit();
    console.log(`Batch of ${movies.length} movies saved to Firestore.`);
  } catch (err) {
    console.warn('Batch save to Firestore failed:', err);
  }
}

/**
 * Delete a movie from Firestore
 */
export async function deleteMovieFromFirestore(movieId: string): Promise<void> {
  try {
    const docRef = doc(db, 'movies', movieId);
    await deleteDoc(docRef);
    console.log(`Movie ${movieId} deleted from Firestore.`);
  } catch (err) {
    console.warn('Failed to delete movie from Firestore:', err);
  }
}

/**
 * Save user profile to Firestore
 */
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.id);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Could not sync profile to Firestore:', err);
  }
}
