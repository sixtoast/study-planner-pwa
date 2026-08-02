export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-400">
          Account, study preferences, integrations
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-slate-400">
          User accounts are powered by Supabase Auth. After you add your
          Supabase keys and run the SQL schema, sign-up / login will appear
          here (email + Google).
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold">Study Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Daily study hours target
            </label>
            <input
              type="number"
              defaultValue={4}
              min={1}
              max={12}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Preferred start time
            </label>
            <input
              type="time"
              defaultValue="09:00"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          These preferences feed the auto-scheduler that places revision blocks
          before each exam.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-950 px-4 py-3">
            <div>
              <p className="font-medium">Google Calendar</p>
              <p className="text-xs text-slate-500">
                Export exams + study blocks
              </p>
            </div>
            <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600">
              Connect (soon)
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-950 px-4 py-3">
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-xs text-slate-500">
                Reminders for study sessions & exams
              </p>
            </div>
            <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600">
              Enable (soon)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
