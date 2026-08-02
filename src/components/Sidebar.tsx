"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Timer,
  BarChart3,
  BookOpen,
  Bot,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Study Calendar", icon: Calendar },
  { href: "/timer", label: "Pomodoro", icon: Timer },
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/ai", label: "AI Tutor", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <GraduationCap className="h-7 w-7 text-blue-500" />
        <span className="text-lg font-bold tracking-tight">StudyPlanner</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        2026 NSC Exam Prep
      </div>
    </aside>
  );
}
