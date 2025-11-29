"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useState } from "react";
import type {
  interviews,
  interviewSteps,
  timeTracking,
  transcriptions,
} from "@/lib/db/schema";
import type { StoredProfile } from "@/lib/types/profile";

type Interview = typeof interviews.$inferSelect;
type Step = typeof interviewSteps.$inferSelect;
type TimeEntry = typeof timeTracking.$inferSelect;
type Transcription = typeof transcriptions.$inferSelect;

interface SidebarProps {
  interview: Interview | null;
  steps: Step[];
  timeEntries: TimeEntry[];
  transcriptions: Transcription[];
  profiles: StoredProfile[];
  profileMap: Record<string, StoredProfile>;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Interview>) => Promise<void>;
  onAddTimeTracking: (data: { interviewId: string; stepId: string; trackedDate: string }) => Promise<void>;
  onAddTranscription: (data: { interviewId: string; stepId: string; content: string }) => Promise<void>;
}

export function Sidebar({
  interview,
  steps,
  timeEntries,
  transcriptions,
  profiles,
  profileMap,
  onClose,
  onUpdate,
  onAddTimeTracking,
  onAddTranscription,
}: SidebarProps) {
  const [scheduledDate, setScheduledDate] = useState(
    () => interview?.interviewDate ?? ""
  );
  const [interviewerName, setInterviewerName] = useState(
    () => interview?.interviewerName ?? ""
  );
  const [currentStepId, setCurrentStepId] = useState(
    () => interview?.currentStepId ?? ""
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    () => interview?.profileId ?? ""
  );
  const [newTimeDate, setNewTimeDate] = useState("");
  const [newTimeStepId, setNewTimeStepId] = useState("");
  const [newTranscriptionStepId, setNewTranscriptionStepId] = useState("");
  const [newTranscriptionContent, setNewTranscriptionContent] = useState("");

  useAutoSave(
    { scheduledDate, interviewerName, currentStepId, selectedProfileId },
    async (data) => {
      if (interview) {
        await onUpdate(interview.id, {
          interviewDate: data.scheduledDate,
          interviewerName: data.interviewerName,
          currentStepId: data.currentStepId,
          profileId: data.selectedProfileId || null,
        });
      }
    }
  );

  if (!interview) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 overflow-y-auto border-l border-white/10 bg-slate-950/80 text-white backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="font-semibold">Interview Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 p-4">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scheduled-date">Scheduled Date</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="step">Current Step</Label>
              <Select
                id="step"
                value={currentStepId}
                onChange={(e) => setCurrentStepId(e.target.value)}
              >
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Profile</Label>
              {profiles.length === 0 ? (
                <p className="text-sm text-slate-300">
                  No profiles yet. Create one from the Profile tab.
                </p>
              ) : (
                <Select
                  value={selectedProfileId}
                  onChange={(event) => setSelectedProfileId(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} {profile.title ? `• ${profile.title}` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            {interview.profileId && profileMap[interview.profileId] && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <p className="font-medium text-slate-100">
                  {profileMap[interview.profileId].name}
                </p>
                <p className="text-slate-300">{profileMap[interview.profileId].email}</p>
                {profileMap[interview.profileId].personalInfo?.phone && (
                  <p className="text-slate-300">{profileMap[interview.profileId].personalInfo?.phone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Time Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="text-sm border-b pb-2">
                  <div className="font-medium text-slate-100">
                    {new Date(entry.trackedDate).toLocaleDateString()}
                  </div>
                  <div className="text-slate-300">
                    {steps.find((s) => s.id === entry.stepId)?.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Add Time Entry</Label>
              <Input
                type="date"
                value={newTimeDate}
                onChange={(e) => setNewTimeDate(e.target.value)}
              />
              <Select
                value={newTimeStepId}
                onChange={(e) => setNewTimeStepId(e.target.value)}
              >
                <option value="">Select step</option>
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                onClick={async () => {
                  if (newTimeDate && newTimeStepId) {
                    await onAddTimeTracking({
                      interviewId: interview.id,
                      stepId: newTimeStepId,
                      trackedDate: newTimeDate,
                    });
                    setNewTimeDate("");
                    setNewTimeStepId("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Transcriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="text-sm border-b pb-2">
                  <div className="font-medium text-slate-100">
                    {steps.find((s) => s.id === transcription.stepId)?.name}
                  </div>
                  <div className="text-slate-300 mt-1">
                    {transcription.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Add Transcription</Label>
              <Select
                value={newTranscriptionStepId}
                onChange={(e) => setNewTranscriptionStepId(e.target.value)}
              >
                <option value="">Select step</option>
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </Select>
              <Textarea
                value={newTranscriptionContent}
                onChange={(e) => setNewTranscriptionContent(e.target.value)}
                placeholder="Enter transcription..."
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (newTranscriptionStepId && newTranscriptionContent) {
                    await onAddTranscription({
                      interviewId: interview.id,
                      stepId: newTranscriptionStepId,
                      content: newTranscriptionContent,
                    });
                    setNewTranscriptionContent("");
                    setNewTranscriptionStepId("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

