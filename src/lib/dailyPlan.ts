import { EXAMS_2026, getExamDisplayName, type Exam } from "@/data/exams";
import { isActiveSubject, getFocusTopics } from "./subjects";
import { addDays, format, parseISO, differenceInCalendarDays, isBefore, startOfDay } from "date-fns";

export type DailyTask = {
  subject: string;
  examName: string;
  examDate: string;
  focus: string;           // specific topic / past-paper focus
  action: string;          // what to actually do
  minutes: number;
  priority: "critical" | "high" | "medium";
};

export type DayPlan = {
  date: string;            // YYYY-MM-DD
  dayLabel: string;        // e.g. "Monday 11 Aug"
  isBreak: boolean;
  breakReason?: string;
  tasks: DailyTask[];
  totalMinutes: number;
};

/**
 * Generates a curated day-by-day study timetable from today until the last exam.
 * - Only includes subjects the learner actually takes
 * - Heavier focus on closer exams
 * - Inserts rest / lighter days
 * - Emphasises past-paper practice
 */
export function generateDailyTimetable(options?: {
  maxMinutesPerDay?: number;
  startDate?: string;
}): DayPlan[] {
  const maxMinutes = options?.maxMinutesPerDay ?? 180; // 3 hours default
  const start = options?.startDate ?? format(new Date(), "yyyy-MM-dd");
  const startDate = parseISO(start);

  // Only active subjects
  const myExams = EXAMS_2026
    .filter((e) => isActiveSubject(e.subject) && e.date >= start)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (myExams.length === 0) return [];

  const lastExamDate = parseISO(myExams[myExams.length - 1].date);
  const totalDays = differenceInCalendarDays(lastExamDate, startDate) + 1;

  const plans: DayPlan[] = [];

  // Track how many focused sessions each exam has received
  const attention: Record<string, number> = {};
  myExams.forEach((e) => (attention[e.id] = 0));

  for (let i = 0; i < totalDays; i++) {
    const current = addDays(startDate, i);
    const dateStr = format(current, "yyyy-MM-dd");
    const dayLabel = format(current, "EEEE d MMM");

    // Find exams within the next 14 days from this day
    const relevant = myExams.filter((e) => {
      const d = differenceInCalendarDays(parseISO(e.date), current);
      return d >= 0 && d <= 14;
    });

    // Rest day rules:
    // - Every 6th day is a lighter / break day
    // - Day before an exam is lighter (only light review)
    // - Exam day itself is not a full study day
    const isExamDay = myExams.some((e) => e.date === dateStr);
    const hasExamTomorrow = myExams.some(
      (e) => differenceInCalendarDays(parseISO(e.date), current) === 1
    );
    const isScheduledBreak = i > 0 && i % 6 === 0;

    if (isExamDay) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason: "Exam day – light review only if needed, then rest",
        tasks: [],
        totalMinutes: 0,
      });
      continue;
    }

    if (isScheduledBreak && !hasExamTomorrow) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason: "Scheduled recovery day – light review or complete rest",
        tasks: [],
        totalMinutes: 0,
      });
      continue;
    }

    // Build tasks for the day
    const tasks: DailyTask[] = [];
    let remaining = hasExamTomorrow ? 60 : maxMinutes; // lighter day before exam

    // Sort relevant exams by urgency then by least attention so far
    const sorted = [...relevant].sort((a, b) => {
      const da = differenceInCalendarDays(parseISO(a.date), current);
      const db = differenceInCalendarDays(parseISO(b.date), current);
      if (da !== db) return da - db;
      return (attention[a.id] || 0) - (attention[b.id] || 0);
    });

    for (const exam of sorted) {
      if (remaining < 30) break;

      const daysLeft = differenceInCalendarDays(parseISO(exam.date), current);
      const topics = getFocusTopics(exam.subject);
      const topicIndex = (attention[exam.id] || 0) % topics.length;
      const focus = topics[topicIndex];

      let minutes = 45;
      let priority: DailyTask["priority"] = "medium";
      let action = "";

      if (daysLeft <= 1) {
        minutes = Math.min(50, remaining);
        priority = "critical";
        action = `Final past-paper practice or quick formula/definition review for ${getExamDisplayName(exam)}. Do not learn new content.`;
      } else if (daysLeft <= 3) {
        minutes = Math.min(60, remaining);
        priority = "critical";
        action = `Write a past-paper section or full paper under timed conditions on: ${focus}. Then mark and review every mistake.`;
      } else if (daysLeft <= 7) {
        minutes = Math.min(50, remaining);
        priority = "high";
        action = `Past-paper questions focused on: ${focus}. Time yourself. Review mark scheme thoroughly.`;
      } else {
        minutes = Math.min(45, remaining);
        priority = "medium";
        action = `Revise theory + do targeted past-paper questions on: ${focus}.`;
      }

      tasks.push({
        subject: exam.subject,
        examName: getExamDisplayName(exam),
        examDate: exam.date,
        focus,
        action,
        minutes,
        priority,
      });

      attention[exam.id] = (attention[exam.id] || 0) + 1;
      remaining -= minutes;
    }

    // If somehow no tasks, make it a light day
    if (tasks.length === 0) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason: "Light day – optional review or rest",
        tasks: [],
        totalMinutes: 0,
      });
    } else {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: false,
        tasks,
        totalMinutes: tasks.reduce((s, t) => s + t.minutes, 0),
      });
    }
  }

  return plans;
}
