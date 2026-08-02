"use client";

import { useEffect, useState } from "react";
import { getSessions, getStreak, getTotalMinutesThisWeek } from "@/lib/storage";
import type { StudySession } from "@/types";
import { Flame, Clock, BookOpen, BarChart3 } from "lucide-react";

export default function StatsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [streak, setStreak] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
    setWeekMinutes(getTotalMinutesThisWeek());
  }, []);

  // Subject breakdown
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Stats</h1>
        <p className="mt-1 text-slate-400">
          Your study data stored on this device
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
            <p className="text-sm text-slate-400">Sessions</p>
            <BookOpen className="h-5 w-5 text-violet-400" />
          </div>
          <p className="mt-2 text-2xl font-bold">{sessions.length}</p>
        </div>
      </div>

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
            {sessions.slice(0, 15).map((s) => (
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
