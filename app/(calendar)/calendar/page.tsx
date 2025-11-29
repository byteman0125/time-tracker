"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfDay, isSameDay, isToday, parseISO, getHours, getMinutes, setHours, setMinutes } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { interviews } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

type Interview = typeof interviews.$inferSelect;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_SLOT_HEIGHT = 40; // pixels per hour - reduced to fit screen

export default function CalendarPage() {
  // Use a fixed date for initial render to avoid hydration mismatch
  const [currentWeek, setCurrentWeek] = useState<Date | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentWeek(new Date());
    setCurrentTime(new Date());
  }, []);

  const weekStart = currentWeek ? startOfWeek(currentWeek, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const data = await response.json();
        const allInterviews = Object.values(data.interviewsByStep || {}).flat() as Interview[];
        setInterviews(allInterviews);
      } catch (error) {
        console.error("Error loading interviews:", error);
      }
    };
    loadInterviews();
    const interval = setInterval(loadInterviews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [mounted]);

  const getInterviewsForDate = useCallback((date: Date) => {
    return interviews.filter((interview) => {
      const interviewDate = parseISO(interview.interviewDate);
      return isSameDay(interviewDate, date);
    });
  }, [interviews]);

  const getInterviewsForTimeSlot = useCallback((date: Date, hour: number) => {
    const dayInterviews = getInterviewsForDate(date);
    return dayInterviews.filter((interview) => {
      // For now, we'll show all interviews for the day
      // In a real implementation, you'd parse interview time from a time field
      return true;
    });
  }, [getInterviewsForDate]);

  const getCurrentTimePosition = useMemo(() => {
    if (!currentTime || !isToday(currentTime) || selectedDate && !isSameDay(selectedDate, currentTime)) {
      return null;
    }
    const hours = getHours(currentTime);
    const minutes = getMinutes(currentTime);
    return hours * TIME_SLOT_HEIGHT + (minutes / 60) * TIME_SLOT_HEIGHT;
  }, [currentTime, selectedDate]);

  const handlePreviousWeek = () => {
    if (currentWeek) setCurrentWeek(subWeeks(currentWeek, 1));
  };
  const handleNextWeek = () => {
    if (currentWeek) setCurrentWeek(addWeeks(currentWeek, 1));
  };
  const handleToday = () => setCurrentWeek(new Date());

  const statusColors: Record<Interview["status"], string> = {
    scheduled: "bg-blue-500/20 border-blue-500/50 text-blue-200",
    rescheduled: "bg-amber-500/20 border-amber-500/50 text-amber-200",
    done: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
    canceled: "bg-rose-500/20 border-rose-500/50 text-rose-200",
  };

  if (!mounted || !currentWeek) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-400">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="mx-auto max-w-[1800px] w-full px-6 py-4 flex-shrink-0">
        <Card className="mb-3 border-slate-700/50 bg-slate-900/60">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  className="border-slate-700/50 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-white">
                  {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  className="border-slate-700/50 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleToday}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-6 pb-4">
        <div className="h-full overflow-auto styled-scrollbar">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-8 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/40">
              {/* Time column */}
              <div className="border-r border-slate-700/50 bg-slate-900/60 sticky left-0 z-20">
                <div className="h-12 border-b border-slate-700/50 sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm shadow-sm"></div>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-slate-700/30"
                    style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                  >
                    <div className="px-2 py-0.5 text-[10px] text-slate-400 font-medium">
                      {mounted ? format(setHours(startOfDay(new Date()), hour), "h a") : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayInterviews = getInterviewsForDate(day);
                const isCurrentDay = isToday(day);
                const isSelected = selectedDate && isSameDay(selectedDate, day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "border-r border-slate-700/50 last:border-r-0 relative",
                      isCurrentDay && "bg-slate-800/30",
                      isSelected && "ring-2 ring-primary/50"
                    )}
                  >
                    {/* Day header */}
                    <div
                      className={cn(
                        "h-12 border-b border-slate-700/50 p-2 cursor-pointer transition-colors sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm",
                        isCurrentDay && "bg-primary/30",
                        isSelected && "bg-primary/40"
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                        {format(day, "EEE")}
                      </div>
                      <div
                        className={cn(
                          "text-base font-semibold",
                          isCurrentDay ? "text-primary" : "text-white"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {HOURS.map((hour) => {
                        const slotInterviews = getInterviewsForTimeSlot(day, hour);
                        const showCurrentTime =
                          isCurrentDay &&
                          getCurrentTimePosition !== null &&
                          getCurrentTimePosition >= hour * TIME_SLOT_HEIGHT &&
                          getCurrentTimePosition < (hour + 1) * TIME_SLOT_HEIGHT;

                        return (
                          <div
                            key={hour}
                            className="border-b border-slate-700/20 relative"
                            style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                          >
                            {/* Current time line */}
                            {showCurrentTime && getCurrentTimePosition !== null && (
                              <div
                                className="absolute left-0 right-0 z-20 flex items-center"
                                style={{ top: `${getCurrentTimePosition - hour * TIME_SLOT_HEIGHT}px` }}
                              >
                                <div className="h-0.5 w-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                                <div className="absolute -left-2 h-3 w-3 rounded-full bg-red-500 border-2 border-slate-950"></div>
                              </div>
                            )}

                            {/* Interview cards */}
                            {slotInterviews.length > 0 && (
                              <div className="absolute inset-0 p-1 space-y-1">
                                {slotInterviews.map((interview) => {
                                  const interviewDate = parseISO(interview.interviewDate);
                                  return (
                                    <div
                                      key={interview.id}
                                      className={cn(
                                        "rounded-md border p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity",
                                        statusColors[interview.status]
                                      )}
                                      onClick={() => {
                                        window.location.href = `/dashboard`;
                                      }}
                                    >
                                      <div className="font-semibold truncate">
                                        {interview.companyName}
                                      </div>
                                      <div className="text-[10px] opacity-80 truncate">
                                        {interview.position}
                                      </div>
                                      <div className="text-[10px] opacity-70 mt-1">
                                        {interview.interviewerName}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-6 pb-4">
        <Card className="border-slate-700/50 bg-slate-900/60">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-300">Current Time</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 border-blue-500/50 text-blue-200 text-[10px]">Scheduled</Badge>
                <Badge className="bg-amber-500/20 border-amber-500/50 text-amber-200 text-[10px]">Rescheduled</Badge>
                <Badge className="bg-emerald-500/20 border-emerald-500/50 text-emerald-200 text-[10px]">Done</Badge>
                <Badge className="bg-rose-500/20 border-rose-500/50 text-rose-200 text-[10px]">Canceled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

