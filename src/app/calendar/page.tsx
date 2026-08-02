"use client";

import { useEffect, useState } from "react";
import { generateDailyTimetable, type DayPlan } from "@/lib/dailyPlan";
import Link from "next/link";
import { Clock, Bot } from "lucide-react";

export default function CalendarPage() {
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timetable = generateDailyTimetable({ maxMinutesPerDay: 180 });
    setPlans(timetable);
    setLoading(false);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  // Collect unique upcoming subjects for the AI plan buttons
  const uniqueSubjects = Array.from(
    new Set(
      plans
        .flatMap((d) => d.tasks.map((t) => t.examName))
        .filter(Boolean)
    )
  ).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Study Timetable</h1>
        <p className="mt-1 text-slate-400">
          Day-by-day plan with specific past-paper tasks for the subjects you take
        </p>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
        <p className="font-medium mb-1">How to use this plan</p>
        <ul className="list-disc list-inside space-y-1 text-blue-200/90">
          <li>Each day shows exactly what to do (no vague “revise”)</li>
          <li>Focus is on past-paper questions and timed practice</li>
          <li>Break days are built in so you don’t burn out</li>
          <li>Want an even more detailed plan for one subject? Use the AI buttons below</li>
        </ul>
      </div>

      {/* AI detailed plans */}
      {uniqueSubjects.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            Generate a full detailed AI study plan for a subject
          </p>
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map((name) => {
              const prompt = `Create a detailed day-by-day study plan for my Grade 12 ${name} exam. Use common questions and topics that appear in NSC and prelim past papers. For each day until the exam give me: 1) exact topics to cover, 2) specific past-paper style tasks (e.g. "do 2022 P1 Question 5 under timed conditions"), 3) how long to spend, and 4) what to review after. Make it realistic for a school learner and include one lighter day every 5–6 days. Start from today.`;
              return (
                <Link
                  key={name}
                  href={`/ai?prompt=${encodeURIComponent(prompt)}`}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs hover:border-blue-500 hover:text-blue-300"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
                        <p className="text-sm text-slate-400 mb-3">{task.action}</p>

                        <div className="flex flex-wrap gap-2">
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
