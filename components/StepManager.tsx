"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

interface StepManagerProps {
  onCreated: () => Promise<void> | void;
}

export function StepManager({ onCreated }: StepManagerProps) {
  const [stepName, setStepName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!stepName.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: stepName.trim() }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to create step");
      }

      setStepName("");
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create step");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-dashed bg-card/60 shadow-none backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Add Interview Stage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="step-name" className="text-xs text-slate-300">
          Stage name
        </Label>
        <Input
          id="step-name"
          placeholder="e.g. Offer Call"
          value={stepName}
          onChange={(event) => setStepName(event.target.value)}
          disabled={isSubmitting}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          size="sm"
          className="w-full"
          onClick={handleCreate}
          disabled={isSubmitting || !stepName.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Stage
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}


