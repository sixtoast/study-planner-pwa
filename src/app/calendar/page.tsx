export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Calendar</h1>
        <p className="mt-1 text-slate-400">
          Personalized revision schedule auto-generated around your exams
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
        <p className="text-lg text-slate-300">FullCalendar integration coming next</p>
        <p className="mt-2 text-sm text-slate-500">
          This page will show exam blocks + AI/auto-generated study sessions.
          You will be able to drag, edit, and export to Google Calendar.
        </p>
      </div>
    </div>
  );
}
