import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Flame, 
  Clock, 
  Target, 
  Film, 
  Calendar, 
  Award, 
  Smartphone,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { DailyWatchStat, UserProfile, WatchProgress } from '../types';

interface AnalyticsDashboardProps {
  onClose: () => void;
  userProfile: UserProfile;
  progressList: WatchProgress[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onClose,
  userProfile,
  progressList,
}) => {
  const [dailyGoal, setDailyGoal] = useState(userProfile.dailyGoalMinutes || 90);

  // Sample 7-day watch duration records (in minutes)
  const weeklyStats: DailyWatchStat[] = [
    { date: '2026-09-05', dayName: 'Sabtu', minutes: 110, moviesWatched: 2 },
    { date: '2026-09-06', dayName: 'Minggu', minutes: 145, moviesWatched: 3 },
    { date: '2026-09-07', dayName: 'Senin', minutes: 65, moviesWatched: 1 },
    { date: '2026-09-08', dayName: 'Selasa', minutes: 80, moviesWatched: 2 },
    { date: '2026-09-09', dayName: 'Rabu', minutes: 95, moviesWatched: 2 },
    { date: '2026-09-10', dayName: 'Kamis', minutes: 120, moviesWatched: 2 },
    { date: '2026-09-11', dayName: 'Hari Ini', minutes: 135, moviesWatched: 3 },
  ];

  const todayMinutes = weeklyStats[weeklyStats.length - 1].minutes;
  const totalWeeklyMinutes = weeklyStats.reduce((acc, s) => acc + s.minutes, 0);
  const avgMinutesPerDay = Math.round(totalWeeklyMinutes / weeklyStats.length);
  const goalProgressPercent = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  const maxChartMinutes = Math.max(...weeklyStats.map(s => s.minutes), 160);

  const genreBreakdown = [
    { name: 'Sci-Fi & Cyberpunk', percent: 35, color: 'bg-purple-500' },
    { name: 'Action & Silat', percent: 28, color: 'bg-rose-500' },
    { name: 'Horor & Misteri', percent: 18, color: 'bg-amber-500' },
    { name: 'Drama & Romantis', percent: 12, color: 'bg-sky-500' },
    { name: 'Animasi & Keluarga', percent: 7, color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Dasbor Analitik Tontonan Personal
              </h3>
              <p className="text-xs text-neutral-400">
                Pantau durasi tontonan harian, kebiasaan streaming, dan target Anda
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Today Duration */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Hari Ini</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white">
                {Math.floor(todayMinutes / 60)}j {todayMinutes % 60}m
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">
                Target harian {dailyGoal}m
              </p>
            </div>

            {/* Streak Days */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Streak Nonton</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-amber-400">
                {userProfile.streakDays} Hari 🔥
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">
                Pertahankan ritme!
              </p>
            </div>

            {/* Weekly Average */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Rata-rata/Hari</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white">
                {avgMinutesPerDay} Menit
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">
                Total 7 hari: {Math.floor(totalWeeklyMinutes / 60)}j
              </p>
            </div>

            {/* Target Completion */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Target className="w-4 h-4 text-rose-400" />
                <span>Target Harian</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-rose-400">
                {goalProgressPercent}%
              </p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Target Tercapai
              </p>
            </div>

          </div>

          {/* Daily Watch Duration Chart (Senin - Minggu) */}
          <div className="p-4 sm:p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Grafik Durasi Tontonan Harian (7 Hari Terakhir)
                </h4>
                <p className="text-xs text-neutral-400">
                  Pantau fluktuasi waktu menonton film Anda setiap harinya
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                Satuan: Menit
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-neutral-800">
              {weeklyStats.map((stat, idx) => {
                const heightPercent = Math.round((stat.minutes / maxChartMinutes) * 100);
                const isToday = idx === weeklyStats.length - 1;

                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    
                    {/* Tooltip & Minutes value */}
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white transition-colors">
                      {stat.minutes}m
                    </span>

                    {/* Bar Pill */}
                    <div className="w-full max-w-[36px] bg-neutral-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-32">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                          isToday
                            ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-lg shadow-rose-600/30'
                            : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[11px] font-semibold truncate ${
                      isToday ? 'text-rose-400 font-bold' : 'text-neutral-400'
                    }`}>
                      {stat.dayName}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Hari Sebelumnya
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Hari Ini
              </span>
            </div>
          </div>

          {/* Genre Preferences & Device Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Genre Distribution */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                Distribusi Genre Favorit
              </h4>
              <div className="space-y-2.5">
                {genreBreakdown.map((g) => (
                  <div key={g.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-300 font-medium">{g.name}</span>
                      <span className="text-neutral-400 font-mono">{g.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal Adjuster */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                  Pengaturan Target Nonton Harian
                </h4>
                <p className="text-xs text-neutral-300 mt-1">
                  Atur batas waktu menonton yang sehat agar waktu istirahat dan produktivitas tetap seimbang.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Target Durasi:</span>
                  <span className="font-bold text-white text-sm">{dailyGoal} Menit / Hari</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={15}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 accent-emerald-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>30 Menit</span>
                  <span>120 Menit</span>
                  <span>240 Menit</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Anda telah mempertahankan streak nonton selama 5 hari berturut-turut!</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
