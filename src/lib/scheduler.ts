import { EXAMS_2026, type Exam, getExamDisplayName } from "@/data/exams";
import { getPrefs } from "./storage";
import { addDays, format, parseISO, isBefore, isAfter, startOfDay } from "date-fns";

export type StudyBlock = {
  id: string;
  title: string;
  subject: string;
  examId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  type: "revision" | "practice" | "exam";
  color: string;
};

/**
 * Auto-generates revision blocks in the days leading up to each exam.
 * Respects the user's daily study hours and preferred time window.
 */
export function generateStudyPlan(options?: {
  hoursPerDay?: number;
  startDate?: string; // YYYY-MM-DD, defaults to today
}): StudyBlock[] {
  const prefs = getPrefs();
  const hoursPerDay = options?.hoursPerDay ?? prefs.studyHoursPerDay;
  const startDate = options?.startDate ?? format(new Date(), "yyyy-MM-dd");

  const blocks: StudyBlock[] = [];
  const usedSlots = new Set<string>(); // date+hour to avoid overlaps

  // Sort exams by date
  const upcomingExams = EXAMS_2026
    .filter((e) => e.date >= startDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  for (const exam of upcomingExams) {
    // Add the exam itself as a block
    blocks.push({
      id: `exam-${exam.id}`,
      title: `EXAM: ${getExamDisplayName(exam)}`,
      subject: exam.subject,
      examId: exam.id,
      date: exam.date,
      startTime: exam.startTime,
      endTime: addMinutes(exam.startTime, exam.durationMinutes),
      type: "exam",
      color: exam.color,
    });

    // Generate revision days: last 5 days before the exam (or fewer if closer)
    const examDate = parseISO(exam.date);
    const revisionDays = 5;

    for (let d = revisionDays; d >= 1; d--) {
      const revDate = addDays(examDate, -d);
      if (isBefore(revDate, startOfDay(new Date()))) continue; // skip past days

      const dateStr = format(revDate, "yyyy-MM-dd");

      // Place a study block in the preferred window
      const startHour = parseInt(prefs.preferredStartTime.split(":")[0], 10);
      let placed = false;

      for (let h = startHour; h < startHour + 8 && !placed; h++) {
        const slotKey = `${dateStr}-${h}`;
        if (usedSlots.has(slotKey)) continue;

        const startTime = `${String(h).padStart(2, "0")}:00`;
        const durationMins = Math.min(90, hoursPerDay * 60 / 2); // ~half daily hours or 90min max
        const endTime = addMinutes(startTime, durationMins);

        blocks.push({
          id: `rev-${exam.id}-${dateStr}`,
          title: `Revise: ${getExamDisplayName(exam)}`,
          subject: exam.subject,
          examId: exam.id,
          date: dateStr,
          startTime,
          endTime,
          type: "revision",
          color: exam.color,
        });

        usedSlots.add(slotKey);
        placed = true;
      }
    }
  }

  return blocks.sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  );
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}
