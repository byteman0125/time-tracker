"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import type { interviews } from "@/lib/db/schema";

type Interview = typeof interviews.$inferSelect;

interface CardEditModalProps {
  interview: Interview | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Interview>) => Promise<void>;
}

export function CardEditModal({
  interview,
  onClose,
  onUpdate,
}: CardEditModalProps) {
  const [interviewerName, setInterviewerName] = useState(
    () => interview?.interviewerName ?? ""
  );
  const [intervieweeName, setIntervieweeName] = useState(
    () => interview?.intervieweeName ?? ""
  );
  const [position, setPosition] = useState(() => interview?.position ?? "");
  const [jobLink, setJobLink] = useState(() => interview?.jobLink ?? "");

  useAutoSave(
    { interviewerName, intervieweeName, position, jobLink },
    async (data) => {
      if (interview) {
        await onUpdate(interview.id, {
          interviewerName: data.interviewerName,
          intervieweeName: data.intervieweeName,
          position: data.position,
          jobLink: data.jobLink || null,
        });
      }
    }
  );

  if (!interview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Interview</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="interviewer">Interviewer</Label>
            <Input
              id="interviewer"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="interviewee">Interviewee</Label>
            <Input
              id="interviewee"
              value={intervieweeName}
              onChange={(e) => setIntervieweeName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
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
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

