"use client";

import { useEffect, useState } from "react";
import { generateDailyTimetable, type DayPlan } from "@/lib/dailyPlan";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function CalendarPage() {
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timetable = generateDailyTimetable({ maxMinutesPerDay: 180 });
    setPlans(timetable);
    setLoading(false);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Study Timetable</h1>
        <p className="mt-1 text-slate-400">
          Curated day-by-day plan focused on past papers for the subjects you actually take
        </p>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
        <p className="font-medium mb-1">How this plan works</p>
        <ul className="list-disc list-inside space-y-1 text-blue-200/90">
          <li>Only includes subjects you take (no Geography, Tourism, Accounting, Life Sciences, Business)</li>
          <li>Prioritises exams that are closest</li>
          <li>Emphasises past-paper practice (the highest-value activity)</li>
          <li>Includes recovery / break days every 6 days and lighter days before exams</li>
        </ul>
      </div>

      {loading ? (
        <p className="text-slate-400">Building your personalised timetable…</p>
      ) : (
        <div className="space-y-6">
          {plans.map((day) => {
            const isToday = day.date === today;
            const isPast = day.date < today;

            return (
              <div
                key={day.date}
                className={`rounded-xl border p-4 ${
                  isToday
                    ? "border-blue-500 bg-blue-500/10"
                    : isPast
                    ? "border-slate-800 bg-slate-900/30 opacity-60"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    {day.dayLabel}
                    {isToday && (
                      <span className="ml-2 text-sm font-normal text-blue-400">(Today)</span>
                    )}
                  </h2>
                  {!day.isBreak && (
                    <span className="text-sm text-slate-400">{day.totalMinutes} min</span>
                  )}
                </div>

                {day.isBreak ? (
                  <p className="text-slate-400 text-sm italic">{day.breakReason}</p>
                ) : (
                  <div className="space-y-3">
                    {day.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-700/80 bg-slate-950/50 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <p className="font-medium">{task.examName}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                task.priority === "critical"
                                  ? "bg-red-500/20 text-red-400"
                                  : task.priority === "high"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-xs text-slate-400">{task.minutes} min</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 mb-1">
                          <span className="text-slate-400">Focus: </span>
                          {task.focus}
                        </p>
                        <p className="text-sm text-slate-400 mb-2">{task.action}</p>

                        <Link
                          href={`/timer?subject=${encodeURIComponent(
                            task.examName
                          )}&minutes=${task.minutes}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Start timer
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
