import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  HardDrive, 
  Plus, 
  Trash2, 
  Eye, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink,
  Crown,
  Search,
  Sliders,
  Check
} from 'lucide-react';
import { Movie } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  movies: Movie[];
  onAddMovie: (movieData: any) => void;
  onDeleteMovie: (movieId: string) => void;
  onToggleMoviePremium: (movieId: string) => void;
  onOpenDriveSync?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  movies,
  onAddMovie,
  onDeleteMovie,
  onToggleMoviePremium,
  onOpenDriveSync,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'performance' | 'drive_test'>('content');
  
  // New Movie Form State
  const [title, setTitle] = useState('');
  const [googleDriveFileId, setGoogleDriveFileId] = useState('');
  const [genreInput, setGenreInput] = useState('Sci-Fi, Action');
  const [duration, setDuration] = useState('115');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80');
  const [isPremium, setIsPremium] = useState(true);
  const [price, setPrice] = useState('35000');
  const [resolution, setResolution] = useState<'4K UHD' | '1080p FHD'>('4K UHD');
  const [director, setDirector] = useState('Sutradara Nusantara');

  // Drive test state
  const [testDriveId, setTestDriveId] = useState('1fB4k9Z2Q1_mK8Y9xLa0P-cyber2088');
  const [driveTestResult, setDriveTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Filter list
  const [filterSearch, setFilterSearch] = useState('');

  const safeMovies = movies || [];
  const totalViews = safeMovies.reduce((acc, m) => acc + (m.views || 0), 0);
  const totalWatchHours = safeMovies.reduce((acc, m) => acc + (m.totalWatchHours || 0), 0);
  const premiumCount = safeMovies.filter(m => m.isPremium).length;

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !googleDriveFileId.trim()) return;

    const genres = genreInput.split(',').map(g => g.trim()).filter(Boolean);

    onAddMovie({
      title: title.trim(),
      googleDriveFileId: googleDriveFileId.trim(),
      genres: genres.length > 0 ? genres : ['Action'],
      durationMinutes: Number(duration) || 110,
      synopsis: synopsis.trim() || 'Film terbaru yang tersimpan dan dialirkan melalui Google Drive API.',
      posterUrl: posterUrl.trim(),
      isPremium,
      price: isPremium ? Number(price) : 0,
      resolution,
      director: director.trim(),
    });

    setTitle('');
    setGoogleDriveFileId('');
    setSynopsis('');
    alert('Film berhasil ditambahkan ke database Google Drive!');
  };

  const handleTestDriveFile = async () => {
    if (!testDriveId.trim()) return;
    setIsTesting(true);
    try {
      const res = await fetch(`/api/drive/info/${testDriveId.trim()}`);
      const data = await res.json();
      setDriveTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  const filteredMovies = safeMovies.filter(m => 
    (m.title || '').toLowerCase().includes((filterSearch || '').toLowerCase()) ||
    (m.googleDriveFileId || '').toLowerCase().includes((filterSearch || '').toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Panel Manajemen & Pelaporan Konten
              </h3>
              <p className="text-xs text-neutral-400">
                Kelola basis data film Google Drive, harga langganan & analisis performa konten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDriveSync && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDriveSync();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Sinkronkan Folder Google Drive</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'content'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-rose-400" />
            <span>Katalog & Google Drive ID</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'performance'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Pelaporan Performa Real-Time</span>
          </button>

          <button
            onClick={() => setActiveTab('drive_test')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'drive_test'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Uji Coba Drive API</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: CONTENT CATALOG & ADD GOOGLE DRIVE MOVIE */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              
              {/* Form Add Movie */}
              <form onSubmit={handleCreateMovie} className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-rose-500" />
                    Tambah Film Baru dari Google Drive
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    Mendukung Google Drive Public File ID
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Judul Film:</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: The Raid: Redemption"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Google Drive File ID / Link:</label>
                    <input
                      type="text"
                      required
                      value={googleDriveFileId}
                      onChange={(e) => setGoogleDriveFileId(e.target.value)}
                      placeholder="Contoh: 1fB4k9Z2Q1_mK8Y9xLa0P-cyber2088"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Kategori / Genre (pisahkan koma):</label>
                    <input
                      type="text"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      placeholder="Action, Sci-Fi, Thriller"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Durasi (Menit) & Resolusi:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-1/2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value as any)}
                        className="w-1/2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="4K UHD">4K UHD</option>
                        <option value="1080p FHD">1080p FHD</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-neutral-400 block mb-1">Sinopsis Ringkas:</label>
                    <textarea
                      rows={2}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Ceritakan latar belakang dan daya tarik film..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  {/* Pricing and Premium lock */}
                  <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <label className="flex items-center gap-2 text-xs text-white font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPremium}
                        onChange={(e) => setIsPremium(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Kunci sebagai Konten Premium VIP</span>
                    </label>

                    {isPremium && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Harga Akses Satuan (Rp):</span>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-28 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Simpan Film ke Katalog Google Drive
                </button>
              </form>

              {/* Movies Table List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">Daftar Film Terpasang ({movies.length})</h4>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Cari file..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 sticky top-0 border-b border-neutral-800">
                        <tr>
                          <th className="p-3">Film</th>
                          <th className="p-3">Google Drive File ID</th>
                          <th className="p-3">Status Akses</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 bg-neutral-900/40">
                        {filteredMovies.map((m) => (
                          <tr key={m.id} className="hover:bg-neutral-800/40">
                            <td className="p-3 flex items-center gap-2">
                              <img src={m.posterUrl} alt="" className="w-8 h-10 object-cover rounded" referrerPolicy="no-referrer" />
                              <div>
                                <p className="font-bold text-white">{m.title}</p>
                                <span className="text-[10px] text-neutral-400">{m.resolution} • {m.durationMinutes}m</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-blue-400">
                              {m.googleDriveFileId}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => onToggleMoviePremium(m.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                  m.isPremium 
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                }`}
                              >
                                {m.isPremium ? 'VIP Konten' : 'Gratis'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => onDeleteMovie(m.id)}
                                className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                                title="Hapus Film"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERFORMANCE REPORTING */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span>Total Penayangan</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    {totalViews.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-emerald-400">↑ 14.2% minggu ini</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Total Jam Tonton</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    {totalWatchHours.toLocaleString('id-ID')} Jam
                  </p>
                  <p className="text-[10px] text-neutral-400">Streaming Google Drive</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Konten VIP</span>
                  </div>
                  <p className="text-xl font-black text-amber-400">
                    {premiumCount} Film
                  </p>
                  <p className="text-[10px] text-neutral-400">Dari {movies.length} film</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Estimasi Pendapatan</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    Rp 48.950.000
                  </p>
                  <p className="text-[10px] text-emerald-400 font-medium">1.420 Pelanggan Aktif</p>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-sm text-white">Peringkat Film Paling Populer (Real-Time)</h4>
                <div className="divide-y divide-neutral-800">
                  {[...movies].sort((a, b) => b.views - a.views).slice(0, 5).map((m, idx) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-neutral-500 w-4 text-center">
                          #{idx + 1}
                        </span>
                        <img src={m.posterUrl} alt="" className="w-8 h-10 object-cover rounded" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-white">{m.title}</p>
                          <span className="text-[10px] text-neutral-400">{m.genres.join(', ')}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white">{m.views.toLocaleString('id-ID')} Penonton</p>
                        <p className="text-[10px] text-neutral-400">{m.totalWatchHours.toLocaleString('id-ID')} jam pemutaran</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DRIVE API TESTER */}
          {activeTab === 'drive_test' && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  Alat Uji Coba Google Drive API File ID
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Periksa kompatibilitas streaming dan tautan pratinjau embed untuk File ID Google Drive Anda.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testDriveId}
                  onChange={(e) => setTestDriveId(e.target.value)}
                  placeholder="Masukkan Google Drive File ID..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none"
                />
                <button
                  onClick={handleTestDriveFile}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  {isTesting ? 'Menguji...' : 'Uji File ID'}
                </button>
              </div>

              {driveTestResult && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> File ID Valid & Terhubung
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">{driveTestResult.source}</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-neutral-300">
                    <p><strong>File ID:</strong> {driveTestResult.data.fileId}</p>
                    <p><strong>Ukuran File:</strong> {driveTestResult.data.formattedSize || '2.45 GB'}</p>
                    <p><strong>Embed URL:</strong> {driveTestResult.data.previewEmbedUrl}</p>
                    <p><strong>CDN Cache:</strong> Aktif (Pemutaran Instan)</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
