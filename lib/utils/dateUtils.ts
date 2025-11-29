import { format, isToday, isSameWeek, isSameMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

export function isCurrentDay(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isToday(dateObj);
}

export function isCurrentWeek(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isSameWeek(dateObj, new Date());
}

export function isCurrentMonth(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isSameMonth(dateObj, new Date());
}

export function getWeekRange(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function shouldMoveToReminder(interviewDate: Date | string): boolean {
  const dateObj = typeof interviewDate === "string" ? parseISO(interviewDate) : interviewDate;
  const daysDiff = Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff >= 2;
}

