"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onViewChange: (view: "weekly" | "monthly") => void;
  currentView: "weekly" | "monthly";
  /**
   * Called when user wants to create a new interview.
   * Should open the create interview modal.
   */
  onCreateCard?: () => void;
}

export function FilterBar({
  onSearch,
  onDateRangeChange,
  onViewChange,
  currentView,
  onCreateCard,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 p-4">
      <div className="min-w-[220px] flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search company, position, interviewer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-8 bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus-visible:border-slate-600 focus-visible:ring-slate-500/50"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="date"
          placeholder="Start date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (e.target.value && endDate) {
              onDateRangeChange(e.target.value, endDate);
            }
          }}
          className="w-40 bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus-visible:border-slate-600 focus-visible:ring-slate-500/50"
        />
        <Input
          type="date"
          placeholder="End date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            if (startDate && e.target.value) {
              onDateRangeChange(startDate, e.target.value);
            }
          }}
          className="w-40 bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus-visible:border-slate-600 focus-visible:ring-slate-500/50"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-slate-700/50 bg-slate-900/50 p-1 shadow-sm">
          <button
            onClick={() => onViewChange("weekly")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors",
              currentView === "weekly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewChange("monthly")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors",
              currentView === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            )}
          >
            Monthly
          </button>
        </div>
        {onCreateCard && (
          <Button
            variant="default"
            size="sm"
            className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onCreateCard}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add interview
          </Button>
        )}
      </div>
    </div>
  );
}

