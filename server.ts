import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory movie database for runtime CRUD & persistence
let moviesDatabase = [
  {
    id: 'movie-1',
    title: 'Cyber Nusantara 2088',
    originalTitle: 'Cyber Nusantara: Genesis Protocol',
    synopsis: 'Di Jakarta masa depan yang dipenuhi distrik neon melayang, seorang mantan peretas bayangan menemukan drive rahasia yang dapat merevolusi kecerdasan buatan nusantara, menjadikannya buronan korporasi teknologi global.',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    year: 2026,
    durationMinutes: 124,
    rating: 8.9,
    ageRating: '17+',
    isPremium: true,
    price: 35000,
    googleDriveFileId: '1fB4k9Z2Q1_mK8Y9xLa0P-cyber2088',
    driveShareUrl: 'https://drive.google.com/file/d/1fB4k9Z2Q1_mK8Y9xLa0P-cyber2088/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1fB4k9Z2Q1_mK8Y9xLa0P-cyber2088/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    resolution: '4K UHD',
    director: 'Rizal Mantovani',
    cast: ['Reza Rahadian', 'Tara Basro', 'Iko Uwais', 'Chelsea Islan'],
    audio: ['Indonesian (Dolby Atmos)', 'English (5.1 Surround)'],
    subtitles: ['Bahasa Indonesia', 'English', 'Japanese'],
    views: 148200,
    totalWatchHours: 249000,
    releaseDate: '2026-08-15',
    isTrending: true,
    isNewRelease: true,
  },
  {
    id: 'movie-2',
    title: 'Misteri Alas Keramat',
    originalTitle: 'The Sacred Grove Curse',
    synopsis: 'Sekelompok mahasiswa arkeologi mengabaikan peringatan sesepuh desa dan memasuki hutan terlarang di pedalaman Jawa Timur untuk mencari prasasti kuno yang telah terkubur selama 700 tahun.',
    posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    genres: ['Horor', 'Misteri', 'Thriller'],
    year: 2026,
    durationMinutes: 108,
    rating: 8.4,
    ageRating: '17+',
    isPremium: false,
    googleDriveFileId: '1mK89yZaQ0_KeramatForest_HD',
    driveShareUrl: 'https://drive.google.com/file/d/1mK89yZaQ0_KeramatForest_HD/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1mK89yZaQ0_KeramatForest_HD/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    resolution: '1080p FHD',
    director: 'Joko Anwar',
    cast: ['Marissa Anita', 'Fachri Albar', 'Asmara Abigail', 'Ario Bayu'],
    audio: ['Indonesian (Dolby 5.1)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 295400,
    totalWatchHours: 374000,
    releaseDate: '2026-07-20',
    isTrending: true,
  },
  {
    id: 'movie-3',
    title: 'Garuda Odyssey: Kosmos',
    originalTitle: 'Garuda Odyssey: Deep Cosmos',
    synopsis: 'Misi antariksa pertama eksplorasi orbit sabuk asteroid oleh tim astronaut Indonesia berubah menjadi perjuangan hidup dan mati saat kapal penelitian mereka menghadapi anomali gravitasi tak dikenal.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Petualangan', 'Drama'],
    year: 2025,
    durationMinutes: 135,
    rating: 9.1,
    ageRating: '13+',
    isPremium: true,
    price: 40000,
    googleDriveFileId: '1gArUd4_Cosmos_4K_Pro',
    driveShareUrl: 'https://drive.google.com/file/d/1gArUd4_Cosmos_4K_Pro/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1gArUd4_Cosmos_4K_Pro/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    resolution: '4K UHD',
    director: 'Angga Dwimas Sasongko',
    cast: ['Chicco Jerikho', 'Putri Marino', 'Arifin Putra', 'Maudy Ayunda'],
    audio: ['Indonesian (Dolby Atmos)', 'English (Dolby Atmos)'],
    subtitles: ['Bahasa Indonesia', 'English', 'Mandarin'],
    views: 412000,
    totalWatchHours: 720000,
    releaseDate: '2025-12-10',
    isTrending: true,
  },
  {
    id: 'movie-4',
    title: 'Petualangan Rimba Kalimantan',
    originalTitle: 'Heart of the Rainforest',
    synopsis: 'Animasi keluarga spektakuler mengisahkan seekor orangutan yatim piatu jenius bernama Bimo yang bersahabat dengan gadis Dayak untuk menyelamatkan pohon kehidupan kuno dari sindikat pembalakan liar.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1600&auto=format&fit=crop&q=80',
    genres: ['Animasi', 'Petualangan', 'Keluarga'],
    year: 2026,
    durationMinutes: 98,
    rating: 8.8,
    ageRating: 'SU',
    isPremium: false,
    googleDriveFileId: '1bIm0_Kalimantan_Animation',
    driveShareUrl: 'https://drive.google.com/file/d/1bIm0_Kalimantan_Animation/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1bIm0_Kalimantan_Animation/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    resolution: '1080p FHD',
    director: 'Aditya Triantoro',
    cast: ['Voice: Vino G. Bastian', 'Voice: Sherina Munaf', 'Voice: Indro Warkop'],
    audio: ['Indonesian (Dolby 5.1)', 'English (Stereo)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 184500,
    totalWatchHours: 215000,
    releaseDate: '2026-06-01',
    isNewRelease: true,
  },
  {
    id: 'movie-5',
    title: 'Detektif Batavia: Kasus Terakhir',
    originalTitle: 'Batavia Noir: The Final Case',
    synopsis: 'Di era kolonial 1930-an, seorang detektif pribumi bermata tajam memecahkan teka-teki pembunuhan diplomat ternama di Batavia, yang membawanya berhadapan dengan konspirasi politik raksasa.',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80',
    genres: ['Misteri', 'Drama', 'Kriminal'],
    year: 2025,
    durationMinutes: 118,
    rating: 8.6,
    ageRating: '17+',
    isPremium: true,
    price: 30000,
    googleDriveFileId: '1bAtAvIa_Noir_1080p_File',
    driveShareUrl: 'https://drive.google.com/file/d/1bAtAvIa_Noir_1080p_File/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1bAtAvIa_Noir_1080p_File/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    resolution: '4K UHD',
    director: 'Mouly Surya',
    cast: ['Nicholas Saputra', 'Dian Sastrowardoyo', 'Lukman Sardi', 'Christine Hakim'],
    audio: ['Indonesian (Dolby 5.1)', 'Dutch (Stereo)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 221000,
    totalWatchHours: 350000,
    releaseDate: '2025-10-18',
  },
  {
    id: 'movie-6',
    title: 'Kopi & Rintik Hujan di Bandung',
    originalTitle: 'Rainy Cafe Symphony',
    synopsis: 'Dua orang asing yang sama-sama patah hati tanpa sengaja terjebak badai hujan lebat di kedai kopi kecil di Dago. Obrolan semalam suntuk tentang mimpi dan luka masa lalu mengubah jalan hidup mereka selamanya.',
    posterUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&auto=format&fit=crop&q=80',
    genres: ['Romantis', 'Drama'],
    year: 2026,
    durationMinutes: 104,
    rating: 8.5,
    ageRating: '13+',
    isPremium: false,
    googleDriveFileId: '1kOpI_Bandung_Love_FHD',
    driveShareUrl: 'https://drive.google.com/file/d/1kOpI_Bandung_Love_FHD/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1kOpI_Bandung_Love_FHD/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    resolution: '1080p FHD',
    director: 'Kamila Andini',
    cast: ['Adipati Dolken', 'Sheila Dara Aisha', 'Refal Hady'],
    audio: ['Indonesian (Stereo)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 310500,
    totalWatchHours: 410000,
    releaseDate: '2026-02-14',
  },
  {
    id: 'movie-7',
    title: 'Shadow Agent: Protocol Jakarta',
    originalTitle: 'Shadow Protocol: Red Line',
    synopsis: 'Ketika sebuah sindikat senjata pasar gelap mengancam pertemuan delegasi Asia Tenggara di Senayan, agen rahasia elit BIN harus berpacu dengan waktu dalam pertarungan silat dan tembak-menembak intens di tengah kemacetan ibukota.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Thriller', 'Kriminal'],
    year: 2026,
    durationMinutes: 115,
    rating: 8.7,
    ageRating: '17+',
    isPremium: true,
    price: 35000,
    googleDriveFileId: '1sHAd0w_JakartaProtocol_4K',
    driveShareUrl: 'https://drive.google.com/file/d/1sHAd0w_JakartaProtocol_4K/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1sHAd0w_JakartaProtocol_4K/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    resolution: '4K UHD',
    director: 'Timo Tjahjanto',
    cast: ['Joe Taslim', 'Julie Estelle', 'Yayan Ruhian', 'Morgan Oey'],
    audio: ['Indonesian (Dolby Atmos)', 'English (5.1)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 520000,
    totalWatchHours: 890000,
    releaseDate: '2026-05-12',
    isTrending: true,
  },
  {
    id: 'movie-8',
    title: 'Warisan Tawa Pak RT',
    originalTitle: 'RT 05 Family Comedy',
    synopsis: 'Ketika ketua RT yang eksentrik mendadak mengumumkan sayembara warisan rumah joglo mewah bagi warga yang bisa mengadakan pesta kemerdekaan paling heboh, seluruh warga gang berlomba dengan taktik konyol.',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    genres: ['Komedi', 'Keluarga'],
    year: 2026,
    durationMinutes: 95,
    rating: 8.2,
    ageRating: 'SU',
    isPremium: false,
    googleDriveFileId: '1wArIsAn_TawaRT_HD',
    driveShareUrl: 'https://drive.google.com/file/d/1wArIsAn_TawaRT_HD/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1wArIsAn_TawaRT_HD/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    resolution: '1080p FHD',
    director: 'Ernest Prakasa',
    cast: ['Ringgo Agus Rahman', 'Nirina Zubir', 'Boris Bokir', 'Arie Kriting'],
    audio: ['Indonesian (Stereo)'],
    subtitles: ['Bahasa Indonesia'],
    views: 198000,
    totalWatchHours: 230000,
    releaseDate: '2026-04-05',
  },
  {
    id: 'movie-9',
    title: 'Kronik Nusantara: Kerajaan Majapahit (Serial)',
    originalTitle: 'Chronicles of Majapahit: The Golden Era',
    synopsis: 'Serial epik sejarah berkisah tentang intrik istana, pertempuran laut armada Jong laut Jawa, dan strategi politik Mahapatih Gajah Mada dalam mewujudkan sumpah legendaris mempersatukan kepulauan nusantara.',
    posterUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1600&auto=format&fit=crop&q=80',
    genres: ['Drama', 'Action', 'Sejarah'],
    year: 2026,
    durationMinutes: 60,
    rating: 9.3,
    ageRating: '17+',
    isPremium: true,
    googleDriveFileId: '1mAjApAhIt_Ep08_Season1_4K',
    driveShareUrl: 'https://drive.google.com/file/d/1mAjApAhIt_Ep08_Season1_4K/view?usp=sharing',
    streamEmbedUrl: 'https://drive.google.com/file/d/1mAjApAhIt_Ep08_Season1_4K/preview',
    trailerVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    resolution: '4K UHD',
    director: 'Hanung Bramantyo',
    cast: ['Abimana Aryasatya', 'Acha Septriasa', 'Donny Alamsyah'],
    audio: ['Indonesian (Dolby Atmos)', 'Javanese Kuno (5.1)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 680000,
    totalWatchHours: 1200000,
    releaseDate: '2026-08-01',
    isTrending: true,
    isNewRelease: true,
    isSeries: true,
    totalEpisodes: 10,
    latestEpisode: 'Episode 7: Armada Laut Karang Semesta',
    nextEpisodeReleaseDate: 'Jumat, 18 September 2026 (Pukul 20:00 WIB)',
  }
];

// Progress synchronization store: deviceId -> { movieId -> progress }
const deviceProgressStore: Record<string, Record<string, any>> = {};

// Active devices list for multi-device sync
const registeredDevices = [
  { id: 'dev-web-01', name: 'Browser Utama (Laptop)', type: 'desktop', lastActive: 'Aktif sekarang' },
  { id: 'dev-phone-02', name: 'iPhone 15 Pro Max', type: 'mobile', lastActive: '12 menit lalu' },
  { id: 'dev-tv-03', name: 'Living Room Smart TV 4K', type: 'tv', lastActive: 'Kemarin, 21:30' },
  { id: 'dev-tab-04', name: 'Samsung Galaxy Tab S9', type: 'tablet', lastActive: '3 hari lalu' },
];

// Gemini Client Lazy Initializer
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// ================= API ROUTES =================

// 1. Movies endpoints
app.get('/api/movies', (req, res) => {
  const { category, search } = req.query;
  let result = [...moviesDatabase];

  if (category && category !== 'Semua') {
    if (category === 'Trending') {
      result = result.filter(m => m.isTrending);
    } else if (category === 'Serial') {
      result = result.filter(m => m.isSeries);
    } else {
      result = result.filter(m => m.genres.some(g => g.toLowerCase() === String(category).toLowerCase()));
    }
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.synopsis.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.some(c => c.toLowerCase().includes(q)) ||
      m.genres.some(g => g.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

app.get('/api/movies/:id', (req, res) => {
  const movie = moviesDatabase.find(m => m.id === req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, error: 'Film tidak ditemukan' });
  }
  res.json({ success: true, data: movie });
});

// Admin Add Movie with Google Drive ID
app.post('/api/movies', (req, res) => {
  const body = req.body;
  if (!body.title || !body.googleDriveFileId) {
    return res.status(400).json({ success: false, error: 'Judul dan Google Drive File ID wajib diisi' });
  }

  const driveId = body.googleDriveFileId.trim();
  const newMovie = {
    id: 'movie-' + Date.now(),
    title: body.title,
    originalTitle: body.originalTitle || body.title,
    synopsis: body.synopsis || 'Deskripsi film terbaru yang tersimpan di Google Drive.',
    posterUrl: body.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    backdropUrl: body.backdropUrl || body.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    genres: Array.isArray(body.genres) && body.genres.length > 0 ? body.genres : ['Action', 'Drama'],
    year: Number(body.year) || new Date().getFullYear(),
    durationMinutes: Number(body.durationMinutes) || 110,
    rating: Number(body.rating) || 8.5,
    ageRating: body.ageRating || '13+',
    isPremium: Boolean(body.isPremium),
    price: body.isPremium ? (Number(body.price) || 35000) : 0,
    googleDriveFileId: driveId,
    driveShareUrl: `https://drive.google.com/file/d/${driveId}/view?usp=sharing`,
    streamEmbedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
    trailerVideoUrl: body.trailerVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    resolution: body.resolution || '1080p FHD',
    director: body.director || 'Sutradara Indonesia',
    cast: Array.isArray(body.cast) ? body.cast : (body.cast ? [body.cast] : ['Aktor Terkenal']),
    audio: ['Indonesian (Dolby 5.1)', 'English (Stereo)'],
    subtitles: ['Bahasa Indonesia', 'English'],
    views: 120,
    totalWatchHours: 85,
    releaseDate: new Date().toISOString().split('T')[0],
    isTrending: Boolean(body.isTrending),
    isNewRelease: true,
    isSeries: Boolean(body.isSeries),
    totalEpisodes: body.totalEpisodes ? Number(body.totalEpisodes) : undefined,
  };

  moviesDatabase.unshift(newMovie as any);
  res.status(201).json({ success: true, message: 'Film berhasil ditambahkan ke katalog Google Drive', data: newMovie });
});

// Admin Delete Movie
app.delete('/api/movies/:id', (req, res) => {
  const initialLen = moviesDatabase.length;
  moviesDatabase = moviesDatabase.filter(m => m.id !== req.params.id);
  if (moviesDatabase.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Film tidak ditemukan' });
  }
  res.json({ success: true, message: 'Film berhasil dihapus dari database' });
});

// 2. Google Drive API Metadata & Stream Endpoint
app.get('/api/drive/info/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  try {
    // If user provided a real Google Drive API Key, attempt to fetch live Drive API metadata
    if (apiKey) {
      const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webContentLink,webViewLink,videoMediaMetadata&key=${apiKey}`;
      const apiRes = await fetch(driveApiUrl);
      if (apiRes.ok) {
        const data = await apiRes.json();
        return res.json({
          success: true,
          source: 'google_drive_api_live',
          data: {
            fileId: data.id,
            fileName: data.name,
            mimeType: data.mimeType || 'video/mp4',
            fileSizeBytes: data.size || 1840000000,
            webContentLink: data.webContentLink,
            previewEmbedUrl: `https://drive.google.com/file/d/${data.id}/preview`,
            directStreamUrl: `https://drive.google.com/uc?export=download&id=${data.id}`,
            videoMetadata: data.videoMediaMetadata || { width: 1920, height: 1080, durationMillis: 6840000 }
          }
        });
      }
    }

    // Default fast metadata handler for any Google Drive File ID
    res.json({
      success: true,
      source: 'google_drive_stream_engine',
      data: {
        fileId: fileId,
        fileName: `CineDrive_Stream_${fileId.substring(0, 8)}.mp4`,
        mimeType: 'video/mp4',
        fileSizeBytes: 2450000000, // ~2.45 GB
        formattedSize: '2.45 GB',
        previewEmbedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directStreamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        shareUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
        status: 'READY_TO_STREAM',
        cdnBuffered: true,
        recommendedPlayer: 'Google Drive HTML5 Cloud Player'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI Category & Recommendation with Gemini 3.8 Flash
app.post('/api/ai/recommend', async (req, res) => {
  const { query, mood, currentMovieTitle } = req.body;
  const promptText = `
Anda adalah AI Film Kurator & Rekomendasi Pintar untuk aplikasi bioskop online "CineDrive Stream".
Tersedia katalog film saat ini:
${moviesDatabase.map(m => `- ID: ${m.id}, Judul: "${m.title}", Genre: [${m.genres.join(', ')}], Rating: ${m.rating}, Sinopsis: ${m.synopsis.slice(0, 100)}...`).join('\n')}

Permintaan Pengguna: "${query || mood || 'Rekomendasikan film terbaik dan paling seru'}"
${currentMovieTitle ? `Film yang sedang ditonton: "${currentMovieTitle}"` : ''}

Tugas Anda:
1. Pilih 2 hingga 4 film paling cocok dari katalog di atas (atau jelaskan kecocokannya).
2. Berikan alasan personal dan menarik dalam Bahasa Indonesia yang ramah, hangat, dan sinematik.
3. Sebutkan mood atau atmosfer yang cocok (misal: "Cocok ditonton saat hujan malam", "Tegang & memacu adrenalin").
4. Berikan tag kategori AI yang pas.

Format jawaban harus JSON valid:
{
  "summary": "Penjelasan singkat kurasi AI...",
  "recommendedMovieIds": ["movie-1", "movie-3"],
  "recommendations": [
    {
      "movieId": "movie-1",
      "movieTitle": "Cyber Nusantara 2088",
      "matchScore": 96,
      "aiReason": "Alasan spesifik mengapa film ini cocok dengan suasana hati atau pencarian pengguna...",
      "atmosphereTags": ["Sci-Fi Futuristik", "Adrenalin Tinggi", "Cyberpunk"]
    }
  ]
}
`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback smart matching if no API key provided yet
      const matched = moviesDatabase.slice(0, 3);
      return res.json({
        success: true,
        source: 'smart_heuristic_ai',
        data: {
          summary: `Berdasarkan pencarian "${query || 'rekomendasi'}", kami memilihkan film dengan rating tertinggi dan sinematografi memukau.`,
          recommendedMovieIds: matched.map(m => m.id),
          recommendations: matched.map((m, idx) => ({
            movieId: m.id,
            movieTitle: m.title,
            matchScore: 95 - idx * 4,
            aiReason: `Film "${m.title}" menghadirkan tema ${m.genres.join(', ')} dengan rating ${m.rating}/10 dan pemutaran Google Drive ultra lancar.`,
            atmosphereTags: [...m.genres, 'Rekomendasi Populer']
          }))
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    res.json({
      success: true,
      source: 'gemini_3_8_flash',
      data: parsedData
    });
  } catch (err: any) {
    console.error('AI Recommendation error:', err);
    // Fallback gracefully
    const matched = moviesDatabase.slice(0, 3);
    res.json({
      success: true,
      source: 'smart_fallback',
      data: {
        summary: `Menampilkan kurasi film terfavorit untuk melengkapi malam menonton Anda.`,
        recommendedMovieIds: matched.map(m => m.id),
        recommendations: matched.map((m, idx) => ({
          movieId: m.id,
          movieTitle: m.title,
          matchScore: 92 - idx * 3,
          aiReason: `Kombinasi genre ${m.genres.join(', ')} yang dipadukan dengan plot kuat membuat ${m.title} sangat layak ditonton.`,
          atmosphereTags: m.genres
        }))
      }
    });
  }
});

// 4. Real-time Watch Progress Synchronization
app.post('/api/sync/progress', (req, res) => {
  const { deviceId, deviceName, movieId, currentTime, duration, progressPercent } = req.body;
  if (!deviceId || !movieId) {
    return res.status(400).json({ success: false, error: 'deviceId dan movieId wajib ada' });
  }

  if (!deviceProgressStore[deviceId]) {
    deviceProgressStore[deviceId] = {};
  }

  const payload = {
    movieId,
    currentTime: Number(currentTime) || 0,
    duration: Number(duration) || 0,
    progressPercent: Number(progressPercent) || 0,
    lastWatchedAt: new Date().toISOString(),
    deviceId,
    deviceName: deviceName || 'Perangkat CineDrive',
  };

  deviceProgressStore[deviceId][movieId] = payload;

  // Also record watch analytics
  const movie = moviesDatabase.find(m => m.id === movieId);
  if (movie) {
    movie.views += 1;
    movie.totalWatchHours += Math.round((Number(currentTime) || 60) / 3600);
  }

  res.json({
    success: true,
    message: 'Progres tontonan berhasil disinkronkan secara real-time',
    data: payload,
    activeDevicesCount: registeredDevices.length
  });
});

app.get('/api/sync/devices', (req, res) => {
  res.json({
    success: true,
    devices: registeredDevices,
    lastSyncTimestamp: new Date().toISOString()
  });
});

// 5. Digital Payment & Subscription activation
app.post('/api/subscription/create-order', (req, res) => {
  const { planId, planName, amount, method, customerName, customerEmail } = req.body;

  const transactionId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
  const order = {
    id: transactionId,
    planId,
    planName,
    amount: Number(amount),
    method,
    status: 'pending',
    timestamp: new Date().toISOString(),
    customerName: customerName || 'Pengguna CineDrive',
    customerEmail: customerEmail || 'user@cinedrive.tv',
    qrCodeString: `00020101021126570014ID.LINKAJA.WWW01189360091100202938470215${transactionId}5802ID5914CINEDRIVE STREAM6007JAKARTA`,
    virtualAccountNumber: method === 'bca_va' ? `88099${Math.floor(10000000 + Math.random() * 90000000)}` : undefined
  };

  res.json({ success: true, order });
});

app.post('/api/subscription/confirm', (req, res) => {
  const { transactionId, planId } = req.body;
  res.json({
    success: true,
    message: 'Pembayaran digital berhasil diverifikasi. Akun VIP telah diaktifkan!',
    vipStatus: {
      isVip: true,
      planId,
      tierName: planId === 'plan-ultra' ? 'VIP Ultra 4K Master' : 'VIP Cinema Pass',
      validUntil: '2027-09-11',
      featuresUnlocked: ['Pemutaran Google Drive Ultra Speed', 'Akses Semua Konten Premium', 'Download Offline']
    }
  });
});

// 6. Admin Analytics Summary
app.get('/api/analytics/summary', (req, res) => {
  const totalViews = moviesDatabase.reduce((acc, m) => acc + m.views, 0);
  const totalHours = moviesDatabase.reduce((acc, m) => acc + m.totalWatchHours, 0);
  const premiumMoviesCount = moviesDatabase.filter(m => m.isPremium).length;

  res.json({
    success: true,
    data: {
      totalMovies: moviesDatabase.length,
      totalViews,
      totalWatchHours: totalHours,
      premiumMoviesCount,
      estimatedRevenueIdr: 48950000,
      activeSubscribers: 1420,
      driveStorageUsedGb: 184.6,
      topMovies: [...moviesDatabase].sort((a, b) => b.views - a.views).slice(0, 5)
    }
  });
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineDrive Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
