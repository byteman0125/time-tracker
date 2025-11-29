"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import type { ProfileOption } from "@/lib/types/profile";
import type { interviewSteps } from "@/lib/db/schema";

type Step = typeof interviewSteps.$inferSelect;

interface CreateCardModalProps {
  stepId: string;
  onClose: () => void;
  onCreate: (data: {
    companyName: string;
    position: string;
    jobLink?: string;
    interviewerName: string;
    intervieweeName: string;
    interviewDate: string;
    currentStepId: string;
    profileId?: string | null;
  }) => Promise<void>;
  profiles: ProfileOption[];
  activeProfileId: string | null;
  steps?: Step[];
}

export function CreateCardModal({
  stepId,
  onClose,
  onCreate,
  profiles,
  activeProfileId,
  steps = [],
}: CreateCardModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [intervieweeName, setIntervieweeName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [profileId, setProfileId] = useState<string | null>(activeProfileId);
  const [selectedStepId, setSelectedStepId] = useState<string>(() => {
    // Default to Intro step if available, otherwise use provided stepId
    const introStep = steps.find((s) => s.name === "Intro");
    return introStep?.id || stepId;
  });

  useEffect(() => {
    setProfileId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    // Update selectedStepId when steps are loaded
    if (steps.length > 0 && !selectedStepId) {
      const introStep = steps.find((s) => s.name === "Intro");
      setSelectedStepId(introStep?.id || steps[0].id);
    }
  }, [steps, selectedStepId]);

  const handleSubmit = async () => {
    if (!companyName || !position || !interviewerName || !intervieweeName || !interviewDate || !selectedStepId) {
      return;
    }
    await onCreate({
      companyName,
      position,
      jobLink: jobLink || undefined,
      interviewerName,
      intervieweeName,
      interviewDate,
      currentStepId: selectedStepId,
      profileId: profileId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Interview</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="jobLink">Job Link</Label>
            <Input
              id="jobLink"
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="interviewer">Interviewer Name *</Label>
            <Input
              id="interviewer"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="interviewee">Interviewee Name *</Label>
            <Input
              id="interviewee"
              value={intervieweeName}
              onChange={(e) => setIntervieweeName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="interviewDate">Interview Date *</Label>
            <Input
              id="interviewDate"
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
            />
          </div>
          {steps.length > 0 && (
            <div>
              <Label htmlFor="stage">Stage *</Label>
              <Select
                id="stage"
                value={selectedStepId}
                onChange={(e) => setSelectedStepId(e.target.value)}
              >
                {steps
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
              </Select>
            </div>
          )}
          <div>
            <Label>Assign Profile</Label>
            {profiles.length === 0 ? (
              <p className="text-sm text-slate-300">
                No profiles yet. Create one under the Profile tab.
              </p>
            ) : (
              <Select
                value={profileId ?? ""}
                onChange={(e) => setProfileId(e.target.value || null)}
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
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Create
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

