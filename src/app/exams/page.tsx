import { EXAMS_2026, getExamDisplayName } from "@/data/exams";
import { daysUntil, formatDuration } from "@/lib/utils";

export default function ExamsPage() {
  const weeks = [1, 2, 3, 4];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Timetable</h1>
        <p className="mt-1 text-slate-400">
          Full 2026 NSC exam schedule (Weeks 1–4)
        </p>
      </div>

      {weeks.map((week) => {
        const weekExams = EXAMS_2026.filter((e) => e.week === week);
        return (
          <section key={week}>
            <h2 className="mb-3 text-lg font-semibold text-slate-300">
              Week {week}
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Subject / Paper</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Countdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {weekExams.map((exam) => {
                    const days = daysUntil(exam.date);
                    return (
                      <tr
                        key={exam.id}
                        className="bg-slate-950/50 hover:bg-slate-900/80"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {exam.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block h-2 w-2 rounded-full mr-2"
                            style={{ backgroundColor: exam.color }}
                          />
                          {getExamDisplayName(exam)}
                        </td>
                        <td className="px-4 py-3">{exam.startTime}</td>
                        <td className="px-4 py-3">
                          {formatDuration(exam.durationMinutes)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              days < 0
                                ? "bg-slate-700 text-slate-400"
                                : days <= 3
                                ? "bg-red-500/20 text-red-400"
                                : days <= 7
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {days < 0
                              ? "Done"
                              : days === 0
                              ? "Today"
                              : days === 1
                              ? "Tomorrow"
                              : `${days} days`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
