"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import type { interviewSteps } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

type Step = typeof interviewSteps.$inferSelect;

interface PipelineBarProps {
  steps: Step[];
  onReorder: (newOrder: Step[]) => Promise<void>;
  onAddStage: () => void;
}

export function PipelineBar({ steps, onReorder, onAddStage }: PipelineBarProps) {
  const [draggedStep, setDraggedStep] = useState<Step | null>(null);
  const [draggedOverStep, setDraggedOverStep] = useState<string | null>(null);
  const [localSteps, setLocalSteps] = useState<Step[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Update local steps when props change
  useEffect(() => {
    setLocalSteps(steps.slice().sort((a, b) => a.order - b.order));
  }, [steps]);

  const handleMoveStep = async (stepId: string, direction: "up" | "down") => {
    const sortedSteps = localSteps.slice().sort((a, b) => a.order - b.order);
    const currentIndex = sortedSteps.findIndex((s) => s.id === stepId);
    
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sortedSteps.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newSteps = [...sortedSteps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];

    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));

    setLocalSteps(updatedSteps);
    await onReorder(updatedSteps);
  };

  const handleDragStart = (e: React.DragEvent, step: Step) => {
    setDraggedStep(step);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", step.id);
  };

  const handleDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedStep && draggedStep.id !== stepId) {
      setDraggedOverStep(stepId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverStep(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedStep || draggedStep.id === targetStepId) {
      setDraggedStep(null);
      setDraggedOverStep(null);
      setIsDragging(false);
      return;
    }

    const sortedSteps = localSteps.slice().sort((a, b) => a.order - b.order);
    const draggedIndex = sortedSteps.findIndex((s) => s.id === draggedStep.id);
    const targetIndex = sortedSteps.findIndex((s) => s.id === targetStepId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedStep(null);
      setDraggedOverStep(null);
      setIsDragging(false);
      return;
    }

    // Reorder steps
    const newSteps = [...sortedSteps];
    const [removed] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, removed);

    // Update order values
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));

    setLocalSteps(updatedSteps);
    setDraggedStep(null);
    setDraggedOverStep(null);
    setIsDragging(false);

    // Save to database
    await onReorder(updatedSteps);
  };

  const handleDragEnd = () => {
    setDraggedStep(null);
    setDraggedOverStep(null);
    setIsDragging(false);
  };

  const sortedSteps = localSteps.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
      <span className="mr-2 font-semibold uppercase tracking-[0.18em] text-slate-400">
        Pipeline
      </span>
      {sortedSteps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === sortedSteps.length - 1;
        const isDragged = draggedStep?.id === step.id;
        const isDropTarget = draggedOverStep === step.id;

        return (
          <div
            key={step.id}
            className={cn(
              "group flex items-center gap-1 rounded-full border transition-all",
              isDragged && "opacity-30 scale-95",
              isDropTarget && "ring-2 ring-primary/80 bg-primary/30 scale-105",
              !isDragged && !isDropTarget && "border-white/15 bg-slate-900/60"
            )}
          >
            {/* Up/Down buttons - always visible */}
            <div className="flex flex-col">
              <button
                onClick={() => handleMoveStep(step.id, "up")}
                disabled={isFirst}
                className={cn(
                  "p-0.5 rounded-t-full transition-colors",
                  isFirst
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-400 hover:text-primary hover:bg-primary/20"
                )}
                title="Move up"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleMoveStep(step.id, "down")}
                disabled={isLast}
                className={cn(
                  "p-0.5 rounded-b-full transition-colors",
                  isLast
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-400 hover:text-primary hover:bg-primary/20"
                )}
                title="Move down"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* Draggable badge */}
            <span
              draggable
              onDragStart={(e) => handleDragStart(e, step)}
              onDragOver={(e) => handleDragOver(e, step.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, step.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-slate-100 cursor-grab active:cursor-grabbing transition-all",
                isDragging && !isDragged && "hover:bg-slate-800/70"
              )}
            >
              <GripVertical className="h-3.5 w-3.5 text-slate-400" />
              {step.name}
            </span>
          </div>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        className="ml-auto border-slate-700/50 bg-slate-900/50 text-slate-200 hover:bg-slate-800/70"
        onClick={onAddStage}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add stage
      </Button>
    </div>
  );
}

