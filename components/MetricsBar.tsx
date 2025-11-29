"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricsBarProps {
  today: number;
  week: number;
  month: number;
  total: number;
  done: number;
  passRate: number;
  reminderCount: number;
  onReminderClick: () => void;
}

export function MetricsBar({
  today,
  week,
  month,
  total,
  done,
  passRate,
  reminderCount,
  onReminderClick,
}: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">Today</div>
          <div className="text-2xl font-bold text-slate-100">{today}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">This Week</div>
          <div className="text-2xl font-bold text-slate-100">{week}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">This Month</div>
          <div className="text-2xl font-bold text-slate-100">{month}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">Total</div>
          <div className="text-2xl font-bold text-slate-100">{total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">Done</div>
          <div className="text-2xl font-bold text-slate-100">{done}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">Pass Rate</div>
          <div className="text-2xl font-bold text-slate-100">{passRate}%</div>
        </CardContent>
      </Card>
      <Card className="cursor-pointer" onClick={onReminderClick}>
        <CardContent className="p-4">
          <div className="text-sm text-slate-300">Reminders</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-slate-100">{reminderCount}</div>
            {reminderCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {reminderCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

