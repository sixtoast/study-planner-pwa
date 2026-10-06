export type Exam = {
  id: string;
  subject: string;
  paper: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  week: number;
  color: string;
};

/**
 * 2026 NSC FINAL Examination Timetable
 * Springs Boys' High School – only subjects the learner takes (highlighted).
 */
export const EXAMS_2026: Exam[] = [
  // WEEK 1: 12–16 Oct
  {
    id: "eng-hl-p3",
    subject: "English HL",
    paper: "P3",
    date: "2026-10-15",
    startTime: "09:00",
    durationMinutes: 180,
    week: 1,
    color: "#3B82F6",
  },
  {
    id: "mech-tech",
    subject: "Mechanical Technology",
    paper: "",
    date: "2026-10-16",
    startTime: "09:00",
    durationMinutes: 180,
    week: 1,
    color: "#F97316",
  },

  // WEEK 2: 19–23 Oct
  {
    id: "afr-fal-p3",
    subject: "Afrikaans FAL",
    paper: "P3",
    date: "2026-10-20",
    startTime: "09:00",
    durationMinutes: 150,
    week: 2,
    color: "#F59E0B",
  },
  {
    id: "egd-p1",
    subject: "Engineering Graphics and Design",
    paper: "P1",
    date: "2026-10-22",
    startTime: "14:00",
    durationMinutes: 180,
    week: 2,
    color: "#EC4899",
  },
  {
    id: "maths-p1",
    subject: "Mathematics",
    paper: "P1",
    date: "2026-10-23",
    startTime: "09:00",
    durationMinutes: 180,
    week: 2,
    color: "#EF4444",
  },

  // WEEK 3: 26–30 Oct
  {
    id: "maths-p2",
    subject: "Mathematics",
    paper: "P2",
    date: "2026-10-26",
    startTime: "09:00",
    durationMinutes: 180,
    week: 3,
    color: "#EF4444",
  },
  {
    id: "egd-p2",
    subject: "Engineering Graphics and Design",
    paper: "P2",
    date: "2026-10-27",
    startTime: "14:00",
    durationMinutes: 180,
    week: 3,
    color: "#EC4899",
  },
  {
    id: "eng-hl-p1",
    subject: "English HL",
    paper: "P1",
    date: "2026-10-28",
    startTime: "09:00",
    durationMinutes: 120,
    week: 3,
    color: "#3B82F6",
  },
  {
    id: "phys-sci-p1",
    subject: "Physical Sciences",
    paper: "P1 (Physics)",
    date: "2026-10-30",
    startTime: "09:00",
    durationMinutes: 180,
    week: 3,
    color: "#0EA5E9",
  },

  // WEEK 4: 2–6 Nov
  {
    id: "phys-sci-p2",
    subject: "Physical Sciences",
    paper: "P2 (Chemistry)",
    date: "2026-11-02",
    startTime: "09:00",
    durationMinutes: 180,
    week: 4,
    color: "#0EA5E9",
  },

  // WEEK 5: 9–13 Nov
  {
    id: "afr-fal-p1",
    subject: "Afrikaans FAL",
    paper: "P1",
    date: "2026-11-11",
    startTime: "09:00",
    durationMinutes: 120,
    week: 5,
    color: "#F59E0B",
  },

  // WEEK 6: 16–20 Nov
  {
    id: "eng-hl-p2",
    subject: "English HL",
    paper: "P2",
    date: "2026-11-19",
    startTime: "09:00",
    durationMinutes: 150,
    week: 6,
    color: "#3B82F6",
  },
  {
    id: "afr-fal-p2",
    subject: "Afrikaans FAL",
    paper: "P2",
    date: "2026-11-20",
    startTime: "09:00",
    durationMinutes: 150,
    week: 6,
    color: "#F59E0B",
  },
];

export function getExamDisplayName(exam: Exam): string {
  return exam.paper ? `${exam.subject} ${exam.paper}` : exam.subject;
}

export function getUpcomingExams(limit = 5): Exam[] {
  const today = new Date().toISOString().slice(0, 10);
  return EXAMS_2026.filter((e) => e.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    )
    .slice(0, limit);
}
