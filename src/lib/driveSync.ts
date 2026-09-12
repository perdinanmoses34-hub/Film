import { Movie } from '../types';

export interface DriveFolderInfo {
  id: string;
  name: string;
}

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  sizeBytes?: number;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  categoryFolder?: string;
}

export interface DriveScanResult {
  rootFolderId: string;
  rootFolderName: string;
  categories: {
    category: string;
    folderId: string;
    videoCount: number;
    files: DriveVideoFile[];
  }[];
  totalVideos: number;
  syncedMovies: Movie[];
}

/**
 * Fetch files or folders inside a parent Google Drive folder
 */
export async function listDriveItems(accessToken: string, parentFolderId: string): Promise<any[]> {
  const query = `'${parentFolderId}' in parents and trashed = false`;
  const fields = 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, videoMediaMetadata)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal membaca folder Google Drive (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Scan root folder (default: user's folder 1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g),
 * detect category subfolders (e.g., Action, Sci-Fi, Horor, Drama, etc.),
 * and retrieve all movie video files into app Movie format.
 */
export async function scanDriveFolderCategories(
  accessToken: string, 
  rootFolderId: string = '1fIXkBtjfRHIbRYEhrmJK7x5xmTGsH47g'
): Promise<DriveScanResult> {
  // 1. Get root folder details
  let rootFolderName = 'Koleksi Film Google Drive';
  try {
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${rootFolderId}?fields=id,name,mimeType&supportsAllDrives=true`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      rootFolderName = meta.name || rootFolderName;
    }
  } catch (e) {
    console.warn('Could not fetch root folder name', e);
  }

  // 2. List items directly in root folder
  const rootItems = await listDriveItems(accessToken, rootFolderId);

  const subfolders = rootItems.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
  const directVideos = rootItems.filter(item => 
    item.mimeType?.startsWith('video/') || 
    item.name?.match(/\.(mp4|mkv|mov|avi|webm)$/i)
  );

  const categoriesResult: DriveScanResult['categories'] = [];
  const syncedMovies: Movie[] = [];

  // If there are direct video files in root, put them under "Koleksi Utama" or "Umum"
  if (directVideos.length > 0) {
    const files: DriveVideoFile[] = directVideos.map(v => ({
      id: v.id,
      name: v.name,
      mimeType: v.mimeType,
      sizeBytes: v.size ? parseInt(v.size, 10) : undefined,
      webViewLink: v.webViewLink,
      webContentLink: v.webContentLink,
      thumbnailLink: v.thumbnailLink,
      categoryFolder: 'Umum'
    }));

    categoriesResult.push({
      category: 'Umum',
      folderId: rootFolderId,
      videoCount: files.length,
      files
    });

    files.forEach(f => {
      syncedMovies.push(convertDriveFileToMovie(f, 'Umum'));
    });
  }

  // Scan subfolders as categories (e.g. Action, Horor, Sci-Fi, Komedi, Drama, etc.)
  for (const folder of subfolders) {
    const folderCategory = folder.name.trim();
    try {
      const folderItems = await listDriveItems(accessToken, folder.id);
      const videoItems = folderItems.filter(item => 
        item.mimeType?.startsWith('video/') || 
        item.name?.match(/\.(mp4|mkv|mov|avi|webm)$/i)
      );

      const files: DriveVideoFile[] = videoItems.map(v => ({
        id: v.id,
        name: v.name,
        mimeType: v.mimeType,
        sizeBytes: v.size ? parseInt(v.size, 10) : undefined,
        webViewLink: v.webViewLink,
        webContentLink: v.webContentLink,
        thumbnailLink: v.thumbnailLink,
        categoryFolder: folderCategory
      }));

      categoriesResult.push({
        category: folderCategory,
        folderId: folder.id,
        videoCount: files.length,
        files
      });

      files.forEach(f => {
        syncedMovies.push(convertDriveFileToMovie(f, folderCategory));
      });
    } catch (err) {
      console.warn(`Gagal membaca folder ${folderCategory}:`, err);
    }
  }

  return {
    rootFolderId,
    rootFolderName,
    categories: categoriesResult,
    totalVideos: syncedMovies.length,
    syncedMovies
  };
}

/**
 * Convert Google Drive Video File to Movie structure
 */
export function convertDriveFileToMovie(file: DriveVideoFile, category: string): Movie {
  // Clean clean title from file extension like .mp4, .mkv, .1080p, etc.
  let cleanTitle = file.name
    .replace(/\.(mp4|mkv|mov|avi|webm)$/i, '')
    .replace(/[._]/g, ' ')
    .replace(/\b(1080p|720p|4k|uhd|bluray|web-dl|x264|hevc)\b/gi, '')
    .trim();

  // Try extracting year if present e.g. "Film Name 2024"
  const yearMatch = cleanTitle.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  if (yearMatch) {
    cleanTitle = cleanTitle.replace(yearMatch[0], '').trim();
  }

  // Choose poster image according to category aesthetic
  const categoryPosters: Record<string, string> = {
    'Action': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    'Sci-Fi': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    'Horor': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=80',
    'Drama': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop&q=80',
    'Komedi': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
    'Animasi': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    'Thriller': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    'Petualangan': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    'Umum': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'
  };

  const defaultPoster = categoryPosters[category] || categoryPosters['Umum'];

  return {
    id: `gdrive-${file.id}`,
    title: cleanTitle || file.name,
    originalTitle: file.name,
    synopsis: `Film disinkronkan langsung dari Google Drive Anda dalam kategori "${category}". Pemutaran lancar dengan Google Drive Video Stream engine resolusi tinggi.`,
    posterUrl: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : defaultPoster,
    backdropUrl: defaultPoster,
    genres: [category, 'Google Drive'],
    year: year,
    durationMinutes: 115,
    rating: 8.7,
    ageRating: '13+',
    isPremium: false,
    googleDriveFileId: file.id,
    fileSizeBytes: file.sizeBytes,
    driveShareUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view?usp=sharing`,
    streamEmbedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    resolution: '1080p FHD',
    director: 'Google Drive Cinema Stream',
    cast: ['Koleksi Pribadi', category],
    audio: ['Original Audio (Stereo/5.1)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 120,
    totalWatchHours: 85,
    releaseDate: `${year}-01-01`,
    isNewRelease: true,
  };
}
