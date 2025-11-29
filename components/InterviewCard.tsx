"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, ExternalLink } from "lucide-react";
import { isCurrentDay } from "@/lib/utils/dateUtils";
import { cn } from "@/lib/utils/cn";
import type { interviews, interviewSteps } from "@/lib/db/schema";
import type { ProfileOption } from "@/lib/types/profile";

type Interview = typeof interviews.$inferSelect;
type Step = typeof interviewSteps.$inferSelect;

interface InterviewCardProps {
  interview: Interview;
  step: Step;
  profile?: ProfileOption;
  onEdit: (id: string) => void;
  onCardClick: (id: string) => void;
  onCardDoubleClick: (id: string) => void;
  onStatusChange: (
    id: string,
    status: "scheduled" | "rescheduled" | "done" | "canceled"
  ) => void;
}

const statusColorMap: Record<Interview["status"], string> = {
  scheduled: "bg-blue-500/20 text-blue-300",
  rescheduled: "bg-amber-500/20 text-amber-300",
  done: "bg-emerald-500/20 text-emerald-200",
  canceled: "bg-rose-500/20 text-rose-200",
};

export function InterviewCard({
  interview,
  step,
  profile,
  onEdit,
  onCardClick,
  onCardDoubleClick,
  onStatusChange,
}: InterviewCardProps) {
  const isToday = isCurrentDay(interview.interviewDate);
  const isDone = interview.status === "done";

  return (
    <Card
      className={cn(
        "cursor-pointer border border-white/5 bg-white/10 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40",
        isToday && "ring-2 ring-primary/60",
        isDone && "opacity-70"
      )}
      onClick={() => onCardClick(interview.id)}
      onDoubleClick={() => onCardDoubleClick(interview.id)}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {interview.companyName}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {step.name}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-300">
              <span>{interview.position}</span>
              {interview.jobLink && (
                <a
                  href={interview.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {profile && (
              <Badge variant="secondary" className="text-[11px]">
                {profile.name}
              </Badge>
            )}
          </div>
          <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-300 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(interview.id);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        </div>

        <div className="grid gap-1 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Interviewer</span>
            <span className="font-medium text-slate-100">{interview.interviewerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Interviewee</span>
            <span className="font-medium text-slate-100">{interview.intervieweeName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="font-medium text-slate-100">
              {new Date(interview.interviewDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs capitalize", statusColorMap[interview.status])}>
            {interview.status}
          </Badge>
          {isToday && <Badge variant="destructive">Today</Badge>}
        </div>

        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(interview.id, "rescheduled");
            }}
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(interview.id, "done");
            }}
          >
            Done
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(interview.id, "canceled");
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

