"use client";

import { useEffect } from "react";
import { checkExamReminders, checkDailyReminder } from "@/lib/notifications";

/** Runs quietly in the background when the app is open */
export function NotificationChecker() {
  useEffect(() => {
    // Small delay so the page can load first
    const t = setTimeout(() => {
      checkExamReminders();
      checkDailyReminder();
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  return null;
}
