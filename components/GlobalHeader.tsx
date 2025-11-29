"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface GlobalHeaderProps {
  reminderCount?: number;
  onReminderClick?: () => void;
}

const pageNames: Record<string, string> = {
  "/calendar": "Calendar",
  "/dashboard": "Interviews",
  "/profile": "Profiles",
  "/metrics": "Metrics",
  "/prompts": "Prompts",
};

export function GlobalHeader({ reminderCount = 0, onReminderClick }: GlobalHeaderProps) {
  const pathname = usePathname();
  // Initialize with null to avoid hydration mismatch, update in useEffect
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const pageName = pageNames[pathname] || "Interview OS";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 backdrop-blur-sm px-6">
      {/* Left: Current Date and Time */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-300">
          {mounted && currentTime ? (
            <>
              <div className="font-medium text-slate-100">
                {format(currentTime, "EEEE, MMMM d, yyyy")}
              </div>
              <div className="text-xs text-slate-400">
                {format(currentTime, "h:mm:ss a")}
              </div>
            </>
          ) : (
            <>
              <div className="font-medium text-slate-100 h-5 w-48 bg-slate-800/50 rounded animate-pulse"></div>
              <div className="text-xs text-slate-400 h-4 w-32 bg-slate-800/50 rounded animate-pulse mt-1"></div>
            </>
          )}
        </div>
      </div>

      {/* Center: Page Name */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-lg font-semibold text-white">{pageName}</h1>
      </div>

      {/* Right: Alarm Button with Badge */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-300 hover:text-white hover:bg-slate-800/70"
          onClick={onReminderClick}
        >
          <Bell className="h-5 w-5" />
          {reminderCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {reminderCount > 99 ? "99+" : reminderCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}

