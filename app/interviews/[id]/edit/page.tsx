"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { ArrowLeft } from "lucide-react";

export default function EditInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    jobLink: "",
    interviewerName: "",
    intervieweeName: "",
    interviewDate: "",
    currentStepId: "",
    status: "scheduled" as const,
  });

  const loadData = useCallback(async () => {
    try {
      const [interviewRes, stepsRes] = await Promise.all([
        fetch(`/api/interviews/${interviewId}`),
        fetch("/api/interviews").then((r) => r.json()),
      ]);

      const interviewData = await interviewRes.json();
      setInterview(interviewData.interview);
      setSteps(stepsRes.steps || []);

      if (interviewData.interview) {
        setFormData({
          companyName: interviewData.interview.companyName || "",
          position: interviewData.interview.position || "",
          jobLink: interviewData.interview.jobLink || "",
          interviewerName: interviewData.interview.interviewerName || "",
          intervieweeName: interviewData.interview.intervieweeName || "",
          interviewDate: interviewData.interview.interviewDate || "",
          currentStepId: interviewData.interview.currentStepId || "",
          status: interviewData.interview.status || "scheduled",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [interviewId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoSave(formData, async (data) => {
    if (interview) {
      try {
        await fetch(`/api/interviews/${interviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Error auto-saving:", error);
      }
    }
  });

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={formData.companyName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, companyName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, position: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="jobLink">Job Link</Label>
            <Input
              id="jobLink"
              type="url"
              value={formData.jobLink}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jobLink: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="interviewer">Interviewer</Label>
            <Input
              id="interviewer"
              value={formData.interviewerName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interviewerName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="interviewee">Interviewee</Label>
            <Input
              id="interviewee"
              value={formData.intervieweeName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, intervieweeName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="interviewDate">Interview Date</Label>
            <Input
              id="interviewDate"
              type="date"
              value={formData.interviewDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interviewDate: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="step">Current Step</Label>
            <Select
              id="step"
              value={formData.currentStepId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currentStepId: e.target.value }))
              }
            >
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </Select>
          </div>
          <Button onClick={() => router.back()} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

