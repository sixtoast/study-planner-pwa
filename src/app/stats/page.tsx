"use client";

import { useEffect, useState } from "react";
import { getSessions, getStreak, getTotalMinutesThisWeek } from "@/lib/storage";
import { getAchievements, type Achievement } from "@/lib/achievements";
import type { StudySession } from "@/types";
import { Flame, Clock, BookOpen, BarChart3, Trophy } from "lucide-react";

export default function StatsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [streak, setStreak] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
    setWeekMinutes(getTotalMinutesThisWeek());
    setAchievements(getAchievements());
  }, []);

  const subjectMap = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration_minutes;
    return acc;
  }, {});

  const subjectStats = Object.entries(subjectMap)
    .map(([subject, mins]) => ({ subject, mins, hours: (mins / 60).toFixed(1) }))
    .sort((a, b) => b.mins - a.mins);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const weekHours = (weekMinutes / 60).toFixed(1);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Stats</h1>
        <p className="mt-1 text-slate-400">
          Your study data and achievements
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Study Streak</p>
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{streak} day{streak === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">This Week</p>
            <Clock className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{weekHours}h</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Hours</p>
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{totalHours}h</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Achievements</p>
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{unlockedCount}/{achievements.length}</p>
        </div>
      </div>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Achievements
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                a.unlocked
                  ? "border-yellow-500/40 bg-yellow-500/10"
                  : "border-slate-800 bg-slate-900/40 opacity-60"
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-slate-400">{a.description}</p>
                {a.unlocked && a.unlockedAt && (
                  <p className="text-xs text-yellow-400/80 mt-1">
                    Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subject breakdown */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Hours by Subject</h2>
        {subjectStats.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Complete some Pomodoro sessions to see a breakdown here.
          </p>
        ) : (
          <div className="space-y-2">
            {subjectStats.map((s) => {
              const pct = totalMinutes > 0 ? (s.mins / totalMinutes) * 100 : 0;
              return (
                <div key={s.subject} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate">{s.subject}</span>
                    <span className="text-slate-400">{s.hours}h</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent sessions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-slate-400 text-sm">No sessions yet. Start the Pomodoro timer!</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 12).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.subject}</p>
                  <p className="text-slate-400 text-xs">
                    {new Date(s.start_time).toLocaleString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-slate-300 font-medium">{s.duration_minutes}m</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
