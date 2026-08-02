export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Stats</h1>
        <p className="mt-1 text-slate-400">
          Hours studied, streaks, subject breakdown and completion rates
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
        <p className="text-lg text-slate-300">Charts will appear here</p>
        <p className="mt-2 text-sm text-slate-500">
          Once you log Pomodoro sessions (with Supabase connected), you will see
          weekly hours, subject pie charts, and study streaks powered by Recharts.
        </p>
      </div>
    </div>
  );
}
