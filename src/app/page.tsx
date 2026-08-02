"use client";

import { useEffect, useState } from "react";
import { getUpcomingExams, getExamDisplayName } from "@/data/exams";
import { daysUntil, formatDuration } from "@/lib/utils";
import { getStreak, getTotalMinutesThisWeek } from "@/lib/storage";
import { getRecommendations, type StudyRecommendation } from "@/lib/recommender";
import { getUnlockedCount } from "@/lib/achievements";
import { CalendarDays, Clock, Target, Flame, BookOpen, Zap, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const upcoming = getUpcomingExams(6);
  const nextExam = upcoming[0];
  const daysToNext = nextExam ? daysUntil(nextExam.date) : null;

  const [streak, setStreak] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [recs, setRecs] = useState<StudyRecommendation[]>([]);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    setWeekMinutes(getTotalMinutesThisWeek());
    setRecs(getRecommendations(4));
    setAchievementsUnlocked(getUnlockedCount());
  }, []);

  const weekHours = (weekMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Your 2026 exam preparation command centre
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Next Exam"
          value={nextExam ? getExamDisplayName(nextExam) : "None"}
          subtitle={
            daysToNext !== null
              ? daysToNext === 0
                ? "Today!"
                : daysToNext === 1
                ? "Tomorrow"
                : `In ${daysToNext} days`
              : "All done"
          }
          icon={<Target className="h-5 w-5 text-blue-400" />}
        />
        <StatCard
          title="Study Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          subtitle={streak > 0 ? "Keep it going!" : "Start a Pomodoro session"}
          icon={<Flame className="h-5 w-5 text-orange-400" />}
        />
        <StatCard
          title="Hours This Week"
          value={`${weekHours}h`}
          subtitle="From your Pomodoro sessions"
          icon={<Clock className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard
          title="Achievements"
          value={`${achievementsUnlocked}`}
          subtitle="Unlocked badges"
          icon={<Trophy className="h-5 w-5 text-yellow-400" />}
        />
      </div>

      {/* WHAT TO STUDY NOW */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-semibold">What to study now</h2>
        </div>

        {recs.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming exams found.</p>
        ) : (
          <div className="space-y-3">
            {recs.map((rec) => (
              <div
                key={rec.exam.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-lg">
                      {getExamDisplayName(rec.exam)}
                    </p>
                    <p className="text-sm text-slate-400">{rec.reason}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      rec.priority === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : rec.priority === "high"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-1">
                  <span className="font-medium text-white">Action: </span>
                  {rec.suggestedAction}
                </p>
                <p className="text-sm text-slate-400 mb-3">
                  <span className="font-medium text-slate-300">Past paper focus: </span>
                  {rec.pastPaperFocus}
                </p>

                <Link
                  href={`/timer?subject=${encodeURIComponent(
                    getExamDisplayName(rec.exam)
                  )}&minutes=${rec.suggestedMinutes}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  <Clock className="h-4 w-4" />
                  Start {rec.suggestedMinutes} min session
                </Link>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Recommendations prioritise exams that are closest and emphasise past-paper practice (the most effective Grade 12 method).
        </p>
      </section>

      {/* Upcoming exams compact */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Exams</h2>
          <Link href="/exams" className="text-sm text-blue-400 hover:text-blue-300">
            View all →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((exam) => {
            const days = daysUntil(exam.date);
            return (
              <div
                key={exam.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{getExamDisplayName(exam)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {exam.date} · {exam.startTime} · {formatDuration(exam.durationMinutes)}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${exam.color}22`,
                      color: exam.color,
                    }}
                  >
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard href="/timer" title="Start Pomodoro" description="Focus session with timer" icon={<Clock className="h-6 w-6" />} />
          <ActionCard href="/calendar" title="Study Calendar" description="View your auto plan" icon={<CalendarDays className="h-6 w-6" />} />
          <ActionCard href="/stats" title="Stats & Achievements" description="Streaks and badges" icon={<Trophy className="h-6 w-6" />} />
          <ActionCard href="/ai" title="Ask AI Tutor" description="Explanations & plans" icon={<BookOpen className="h-6 w-6" />} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-blue-600/50 hover:bg-slate-900"
    >
      <div className="rounded-lg bg-blue-600/20 p-2 text-blue-400">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
