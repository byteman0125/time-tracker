"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import type { StoredProfile } from "@/lib/types/profile";
import { cn } from "@/lib/utils/cn";
import { Plus, Trash2 } from "lucide-react";

const PROFILE_STORAGE_KEY = "profiles";
const ACTIVE_PROFILE_KEY = "activeProfileId";

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<StoredProfile[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedActive = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedActive) return storedActive || null;
      const storedProfiles = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles) as StoredProfile[];
        return parsed[0]?.id ?? null;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeProfileId) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    }
  }, [activeProfileId]);

  useAutoSave(activeProfile, async (draft) => {
    if (!draft) return;
    setProfiles((current) =>
      current.map((profile) => (profile.id === draft.id ? draft : profile))
    );
  });

  const handleAddProfile = () => {
    const newProfile: StoredProfile = {
      id: crypto.randomUUID(),
      name: "",
      email: "",
      personalInfo: {},
    };
    setProfiles((current) => [...current, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter((profile) => profile.id !== id);
      setActiveProfileId(remaining[0]?.id ?? null);
    }
  };

  const updateProfile = (field: keyof StoredProfile, value: string) => {
    if (!activeProfile) return;
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === activeProfile.id ? { ...profile, [field]: value } : profile
      )
    );
  };

  const updatePersonalInfo = (
    field: keyof NonNullable<StoredProfile["personalInfo"]>,
    value: string
  ) => {
    if (!activeProfile) return;
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === activeProfile.id
          ? {
              ...profile,
              personalInfo: { ...profile.personalInfo, [field]: value },
            }
          : profile
      )
    );
  };

  async function handleResumeUpload() {
    if (!resumeFile || !activeProfile) return;
    try {
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === activeProfile.id
            ? { ...profile, resumeUrl: resumeFile.name }
            : profile
        )
      );
      setResumeFile(null);
    } catch (error) {
      console.error("Error uploading resume:", error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Profiles
          </p>
          <h1 className="text-4xl font-semibold text-white">Talent profiles</h1>
        </div>
        <Button onClick={handleAddProfile}>
          <Plus className="mr-2 h-4 w-4" />
          Add profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          {profiles.length === 0 ? (
            <p className="text-sm text-slate-300">
              Add your first profile to begin tracking interviews.
            </p>
          ) : (
            profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setActiveProfileId(profile.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition",
                  profile.id === activeProfileId
                    ? "border-primary/60 bg-primary/10 text-white"
                    : "hover:border-white/20"
                )}
              >
                <div>
                  <p className="text-sm font-medium">
                    {profile.name || "Unnamed profile"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {profile.email || "No email yet"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteProfile(profile.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </button>
            ))
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {activeProfile ? (
            <>
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="col-span-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={activeProfile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={activeProfile.email}
                      onChange={(e) => updateProfile("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={activeProfile.personalInfo?.phone || ""}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={activeProfile.personalInfo?.location || ""}
                      onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={activeProfile.personalInfo?.linkedin || ""}
                      onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={activeProfile.personalInfo?.github || ""}
                      onChange={(e) => updatePersonalInfo("github", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      value={activeProfile.personalInfo?.notes || ""}
                      onChange={(e) => updatePersonalInfo("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle>Resume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  {activeProfile.resumeUrl && (
                    <p className="text-sm text-slate-300">
                      Current: {activeProfile.resumeUrl}
                    </p>
                  )}
                  <Button onClick={handleResumeUpload} disabled={!resumeFile}>
                    Upload
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-white/30 bg-white/5">
              <CardContent className="py-16 text-center text-slate-300">
                Create a profile to start storing interview data.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

