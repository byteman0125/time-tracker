"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Sidebar } from "@/components/Sidebar";
import { FilterBar } from "@/components/FilterBar";
import { CardEditModal } from "@/components/CardEditModal";
import { CreateCardModal } from "@/components/CreateCardModal";
import { getWeekRange, getMonthRange } from "@/lib/utils/dateUtils";
import type { interviews, interviewSteps } from "@/lib/db/schema";
import type { StoredProfile, ProfileOption } from "@/lib/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { PipelineBar } from "@/components/PipelineBar";

type Interview = typeof interviews.$inferSelect;
type Step = typeof interviewSteps.$inferSelect;

const PROFILE_STORAGE_KEY = "profiles";
const ACTIVE_PROFILE_KEY = "activeProfileId";

export default function DashboardPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [rawInterviewsByStep, setRawInterviewsByStep] = useState<Record<string, Interview[]>>({});
  const [displayInterviewsByStep, setDisplayInterviewsByStep] = useState<Record<string, Interview[]>>({});
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    done: 0,
    passRate: 0,
  });
  const [profiles, setProfiles] = useState<StoredProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Interview | null>(null);
  const [creatingCard, setCreatingCard] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"weekly" | "monthly">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageName, setStageName] = useState("");
  const [savingStage, setSavingStage] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [reminderCount, setReminderCount] = useState(0);

  const profileOptions: ProfileOption[] = useMemo(
    () =>
      profiles.map((profile) => ({
        id: profile.id,
        name: profile.name || "Unnamed profile",
        email: profile.email,
        title: profile.title,
      })),
    [profiles]
  );

  const profileMap = useMemo(() => {
    const map: Record<string, StoredProfile> = {};
    for (const profile of profiles) {
      map[profile.id] = profile;
    }
    return map;
  }, [profiles]);

  const viewRange = useMemo(() => {
    const { start, end } =
      currentView === "weekly" ? getWeekRange() : getMonthRange();
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, [currentView]);

  const filteredInterviewsByStep = useMemo(() => {
    const map: Record<string, Interview[]> = {};
    for (const [stepId, interviews] of Object.entries(displayInterviewsByStep)) {
      let filtered = interviews.filter(
        (interview) =>
          interview.interviewDate >= viewRange.start &&
          interview.interviewDate <= viewRange.end
      );
      if (activeProfileId) {
        filtered = filtered.filter(
          (interview) => interview.profileId === activeProfileId
        );
      }
      map[stepId] = filtered;
    }
    return map;
  }, [displayInterviewsByStep, viewRange, activeProfileId]);

  const loadProfiles = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const parsed: StoredProfile[] = stored ? JSON.parse(stored) : [];
      setProfiles(parsed);

      const storedActive = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedActive) {
        setActiveProfileId(storedActive || null);
      } else if (parsed.length > 0) {
        setActiveProfileId(parsed[0].id);
        window.localStorage.setItem(ACTIVE_PROFILE_KEY, parsed[0].id);
      } else {
        setActiveProfileId(null);
      }
    } catch {
      setProfiles([]);
      setActiveProfileId(null);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
    const handler = () => loadProfiles();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [loadProfiles]);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch("/api/interviews");
      const data = await response.json();
      setSteps(data.steps);
      setRawInterviewsByStep(data.interviewsByStep);
      setDisplayInterviewsByStep(data.interviewsByStep);
      setMetrics(data.metrics);
      setReminderCount(data.reminderCount || 0);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const loadInterviewDetails = useCallback(async (interviewId: string) => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`);
      const data = await response.json();
      setTimeEntries(data.timeEntries);
      setTranscriptions(data.transcriptions);
    } catch (error) {
      console.error("Error loading interview details:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (selectedInterview) {
      loadInterviewDetails(selectedInterview.id);
    }
  }, [selectedInterview, loadInterviewDetails]);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setDisplayInterviewsByStep(rawInterviewsByStep);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      const interviewsMap: Record<string, Interview[]> = {};
      for (const step of steps) {
        interviewsMap[step.id] = results.filter(
          (interview: Interview) => interview.currentStepId === step.id
        );
      }
      setDisplayInterviewsByStep(interviewsMap);
    } catch (error) {
      console.error("Error searching:", error);
    }
  }

  async function handleDateRangeChange(start: string, end: string) {
    try {
      const response = await fetch(`/api/search?startDate=${start}&endDate=${end}`);
      const results = await response.json();
      const interviewsMap: Record<string, Interview[]> = {};
      for (const step of steps) {
        interviewsMap[step.id] = results.filter(
          (interview: Interview) => interview.currentStepId === step.id
        );
      }
      setDisplayInterviewsByStep(interviewsMap);
    } catch (error) {
      console.error("Error filtering by date:", error);
    }
  }

  async function handleCreateCard(data: {
    companyName: string;
    position: string;
    jobLink?: string;
    interviewerName: string;
    intervieweeName: string;
    interviewDate: string;
    currentStepId: string;
    profileId?: string | null;
  }) {
    try {
      await fetch("/api/interviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadData();
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  }

  async function handleUpdateInterview(id: string, data: Partial<Interview>) {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await response.json();
      await loadData();
      if (selectedInterview?.id === id) {
        setSelectedInterview(updated);
      }
    } catch (error) {
      console.error("Error updating interview:", error);
    }
  }

  async function handleStatusChange(
    id: string,
    status: "scheduled" | "rescheduled" | "done" | "canceled"
  ) {
    await handleUpdateInterview(id, { status });
  }

  async function handleAddTimeTracking(data: {
    interviewId: string;
    stepId: string;
    trackedDate: string;
  }) {
    try {
      await fetch("/api/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadInterviewDetails(data.interviewId);
    } catch (error) {
      console.error("Error adding time tracking:", error);
    }
  }

  async function handleAddTranscription(data: {
    interviewId: string;
    stepId: string;
    content: string;
  }) {
    try {
      await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadInterviewDetails(data.interviewId);
    } catch (error) {
      console.error("Error adding transcription:", error);
    }
  }

  async function handleCardClick(id: string) {
    try {
      const response = await fetch(`/api/interviews/${id}`);
      const data = await response.json();
      setSelectedInterview(data.interview);
      setTimeEntries(data.timeEntries);
      setTranscriptions(data.transcriptions);
    } catch (error) {
      console.error("Error loading interview:", error);
    }
  }

  const pageBackground =
    "h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden flex flex-col";

  return (
    <div className={pageBackground}>
      <div className="flex flex-col h-full overflow-hidden px-6 py-4 space-y-4">
        {/* Default interview pipeline overview */}
        <PipelineBar
          steps={steps}
          onReorder={async (newOrder) => {
            try {
              await fetch("/api/steps/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ steps: newOrder.map((s) => ({ id: s.id, order: s.order })) }),
              });
              await loadData();
            } catch (error) {
              console.error("Error reordering steps:", error);
            }
          }}
          onAddStage={() => {
            setStageError(null);
            setStageName("");
            setIsStageModalOpen(true);
          }}
        />

        <div className="space-y-6">
          <FilterBar
            onSearch={handleSearch}
            onDateRangeChange={handleDateRangeChange}
            onViewChange={setCurrentView}
            currentView={currentView}
            onCreateCard={() => {
              const introStep = steps.find((s) => s.name === "Intro");
              if (introStep) {
                setCreatingCard(introStep.id);
              }
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <KanbanBoard
            steps={steps}
            interviewsByStep={filteredInterviewsByStep}
            profileMap={profileMap}
            onEdit={(id) => {
              const interview = Object.values(displayInterviewsByStep)
                .flat()
                .find((item) => item.id === id);
              setEditingCard(interview || null);
            }}
            onCardClick={handleCardClick}
            onCardDoubleClick={(id) => {
              window.location.href = `/interviews/${id}/edit`;
            }}
            onStatusChange={handleStatusChange}
          />
        </div>

        {selectedInterview && (
          <Sidebar
            key={selectedInterview.id}
            interview={selectedInterview}
            steps={steps}
            timeEntries={timeEntries}
            transcriptions={transcriptions}
            profiles={profiles}
            profileMap={profileMap}
            onClose={() => setSelectedInterview(null)}
            onUpdate={handleUpdateInterview}
            onAddTimeTracking={handleAddTimeTracking}
            onAddTranscription={handleAddTranscription}
          />
        )}

        {editingCard && (
          <CardEditModal
            key={editingCard.id}
            interview={editingCard}
            onClose={() => setEditingCard(null)}
            onUpdate={handleUpdateInterview}
          />
        )}

        {creatingCard && (
          <CreateCardModal
            stepId={creatingCard}
            onClose={() => setCreatingCard(null)}
            onCreate={handleCreateCard}
            profiles={profileOptions}
            activeProfileId={activeProfileId}
            steps={steps}
          />
        )}

        {/* Stage creation modal */}
        {isStageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 p-5 shadow-2xl">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                New interview stage
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                Example: <span className="font-medium text-slate-200">Hiring Manager</span>,{" "}
                <span className="font-medium text-slate-200">Technical Loop</span>,{" "}
                <span className="font-medium text-slate-200">CTO</span>
              </p>
              <Input
                autoFocus
                placeholder="Stage name"
                value={stageName}
                onChange={(e) => {
                  setStageName(e.target.value);
                  if (stageError) setStageError(null);
                }}
                className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus-visible:border-slate-600 focus-visible:ring-slate-500/50"
              />
              {stageError && (
                <p className="mt-2 text-[11px] text-red-400">{stageError}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (savingStage) return;
                    setIsStageModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={savingStage || !stageName.trim()}
                  onClick={async () => {
                    const name = stageName.trim();
                    if (!name) {
                      setStageError("Stage name is required.");
                      return;
                    }
                    setSavingStage(true);
                    try {
                      const response = await fetch("/api/steps", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                      });
                      if (!response.ok) {
                        const body = await response.json().catch(() => ({}));
                        throw new Error(body.error || "Failed to create stage");
                      }
                      setIsStageModalOpen(false);
                      setStageName("");
                      await loadData();
                    } catch (error) {
                      setStageError(
                        error instanceof Error
                          ? error.message
                          : "Unable to create stage. Please try again."
                      );
                    } finally {
                      setSavingStage(false);
                    }
                  }}
                >
                  {savingStage ? "Saving…" : "Add stage"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
