"use client";

import { useEffect, useState } from "react";
import { generateStudyPlan, type StudyBlock } from "@/lib/scheduler";
import { getPrefs, savePrefs } from "@/lib/storage";

export default function CalendarPage() {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prefs = getPrefs();
    setHoursPerDay(prefs.studyHoursPerDay);
    const plan = generateStudyPlan({ hoursPerDay: prefs.studyHoursPerDay });
    setBlocks(plan);
    setLoading(false);
  }, []);

  const regenerate = () => {
    savePrefs({ studyHoursPerDay: hoursPerDay });
    const plan = generateStudyPlan({ hoursPerDay });
    setBlocks(plan);
  };

  // Group by date
  const byDate = blocks.reduce<Record<string, StudyBlock[]>>((acc, b) => {
    if (!acc[b.date]) acc[b.date] = [];
    acc[b.date].push(b);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Calendar</h1>
        <p className="mt-1 text-slate-400">
          Auto-generated revision plan based on your 2026 exams
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Hours of study per day
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value) || 4)}
            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={regenerate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Regenerate Plan
        </button>
        <p className="text-xs text-slate-500 self-center">
          Changing hours and regenerating will create a new schedule.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400">Generating your personalised plan…</p>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="mb-2 text-lg font-semibold text-slate-300">
                {new Date(date + "T00:00:00").toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="space-y-2">
                {byDate[date].map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <div
                      className="h-10 w-1.5 rounded-full"
                      style={{ backgroundColor: block.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{block.title}</p>
                      <p className="text-sm text-slate-400">
                        {block.startTime} – {block.endTime}
                        {block.type === "exam" && (
                          <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                            EXAM
                          </span>
                        )}
                        {block.type === "revision" && (
                          <span className="ml-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-400">
                            Revision
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sortedDates.length === 0 && (
            <p className="text-slate-400">No upcoming exams found.</p>
          )}
        </div>
      )}
    </div>
  );
}
