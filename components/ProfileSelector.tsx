"use client";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProfileOption } from "@/lib/types/profile";
import { Users, UserPlus } from "lucide-react";

interface ProfileSelectorProps {
  profiles: ProfileOption[];
  activeProfileId: string | null;
  onChange: (id: string | null) => void;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onChange,
}: ProfileSelectorProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Users className="h-4 w-4" />
        Active Profile
      </div>
      <Select
        value={activeProfileId ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="bg-background"
      >
        <option value="">All profiles</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name} {profile.title ? `• ${profile.title}` : ""}
          </option>
        ))}
      </Select>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => (window.location.href = "/profile")}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Manage Profiles
      </Button>
    </div>
  );
}


