import { getUpcomingExams, getExamDisplayName } from "@/data/exams";
import { daysUntil, formatDuration } from "@/lib/utils";
import { CalendarDays, Clock, Target, Flame, BookOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const upcoming = getUpcomingExams(6);
  const nextExam = upcoming[0];
  const daysToNext = nextExam ? daysUntil(nextExam.date) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Your 2026 exam preparation command centre
        </p>
      </div>

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
          value="0 days"
          subtitle="Start a Pomodoro session"
          icon={<Flame className="h-5 w-5 text-orange-400" />}
        />
        <StatCard
          title="Hours This Week"
          value="0h"
          subtitle="Log study time to track"
          icon={<Clock className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard
          title="Exams Remaining"
          value={String(upcoming.length)}
          subtitle="Until end of timetable"
          icon={<BookOpen className="h-5 w-5 text-violet-400" />}
        />
      </div>

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

      <section>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard href="/timer" title="Start Pomodoro" description="Focus session with timer" icon={<Clock className="h-6 w-6" />} />
          <ActionCard href="/calendar" title="Study Calendar" description="View & edit your plan" icon={<CalendarDays className="h-6 w-6" />} />
          <ActionCard href="/ai" title="Ask AI Tutor" description="Get explanations & plans" icon={<BookOpen className="h-6 w-6" />} />
          <ActionCard href="/settings" title="Generate Plan" description="Auto-schedule revision" icon={<Target className="h-6 w-6" />} />
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
        <p className="text-slate-400">
          Study sessions and AI-generated plans will appear here once you connect Supabase and start logging time.
        </p>
        <p className="mt-2 text-sm text-slate-500">See the README for setup instructions.</p>
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
