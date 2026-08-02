export type StudySession = {
  id: string;
  user_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes?: string;
  type: "pomodoro" | "revision" | "practice";
  created_at: string;
};

export type StudyPlanSlot = {
  id: string;
  user_id: string;
  exam_id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  completed: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  study_hours_per_day: number;
  preferred_start_time: string; // "HH:mm"
  preferred_end_time: string;
  subjects: string[]; // subjects the user is taking
  created_at: string;
  updated_at: string;
};
