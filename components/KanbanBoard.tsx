"use client";

import { InterviewCard } from "./InterviewCard";
import type { interviews, interviewSteps } from "@/lib/db/schema";
import type { ProfileOption } from "@/lib/types/profile";
import { cn } from "@/lib/utils/cn";

type Interview = typeof interviews.$inferSelect;
type Step = typeof interviewSteps.$inferSelect;

interface KanbanBoardProps {
  steps: Step[];
  interviewsByStep: Record<string, Interview[]>;
  onEdit: (id: string) => void;
  onCardClick: (id: string) => void;
  onCardDoubleClick: (id: string) => void;
  onStatusChange: (
    id: string,
    status: "scheduled" | "rescheduled" | "done" | "canceled"
  ) => void;
  profileMap: Record<string, ProfileOption>;
}

export function KanbanBoard({
  steps,
  interviewsByStep,
  onEdit,
  onCardClick,
  onCardDoubleClick,
  onStatusChange,
  profileMap,
}: KanbanBoardProps) {
  const columnThemes = [
    "from-sky-400/20 via-sky-900/30 to-slate-950/70 border-sky-500/20",
    "from-emerald-400/20 via-emerald-900/40 to-slate-950/70 border-emerald-500/20",
    "from-amber-400/25 via-amber-900/30 to-slate-950/70 border-amber-500/20",
    "from-violet-400/25 via-violet-900/30 to-slate-950/70 border-violet-500/25",
    "from-rose-400/25 via-rose-900/30 to-slate-950/70 border-rose-500/20",
    "from-cyan-400/25 via-cyan-900/30 to-slate-950/70 border-cyan-500/20",
  ];

  const orderedSteps = steps.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full min-h-0 gap-6 overflow-x-auto overflow-y-hidden pb-2 styled-scrollbar">
      {orderedSteps.map((step, index) => {
        const stepInterviews = interviewsByStep[step.id] || [];
        const isIntroStep = step.name === "Intro";
        const theme = columnThemes[index % columnThemes.length];

        return (
          <div
            key={step.id}
            id={`step-${step.id}`}
            className={cn(
              "flex h-full w-80 flex-shrink-0 flex-col rounded-xl border bg-gradient-to-b p-4 shadow-xl shadow-black/40 backdrop-blur",
              theme
            )}
          >
            <div className="mb-4 grid grid-cols-3 items-center border-b border-white/20 pb-3">
              <span className="text-sm text-slate-300">
                {stepInterviews.length}
              </span>
              <h2 className="text-lg font-semibold text-slate-100 text-center">
                {step.name}
              </h2>
              <div className="flex items-center justify-end">
                {/* Add button moved to filter bar */}
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {stepInterviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                  No interviews
                </div>
              ) : (
                stepInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    step={step}
                    profile={
                      interview.profileId ? profileMap[interview.profileId] : undefined
                    }
                    onEdit={onEdit}
                    onCardClick={onCardClick}
                    onCardDoubleClick={onCardDoubleClick}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

