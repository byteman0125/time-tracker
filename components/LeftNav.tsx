"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, CalendarDays, UserCircle2, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { StoredProfile } from "@/lib/types/profile";
import { useEffect, useState, Suspense } from "react";
import { Logo } from "@/components/Logo";

const PROFILE_STORAGE_KEY = "profiles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const mainItems: NavItem[] = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard", label: "Interviews", icon: LayoutDashboard },
  { href: "/profile", label: "Profiles", icon: UserCircle2 },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
];

function ProfileList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<StoredProfile[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const parsed: StoredProfile[] = stored ? JSON.parse(stored) : [];
      setProfiles(parsed);
    } catch {
      setProfiles([]);
    }
  }, []);

  const activeProfileId = searchParams.get("profileId");

  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Profiles
      </p>
      {profiles.length === 0 ? (
        <p className="px-3 text-[11px] text-slate-500">
          No profiles yet. Create one in the Profiles page.
        </p>
      ) : (
        <div className="space-y-1">
          {profiles.map((profile) => {
            const isActiveProfile =
              pathname.startsWith("/profile") && activeProfileId === profile.id;
            return (
              <Link
                key={profile.id}
                href={`/profile?profileId=${profile.id}`}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-1.5 text-[11px] transition-colors",
                  isActiveProfile
                    ? "bg-primary/20 text-primary-foreground ring-1 ring-primary/40"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                <span className="truncate">{profile.name || "Unnamed"}</span>
                <span className="ml-2 text-[10px] text-slate-400">
                  {profile.personalInfo?.location || profile.email || ""}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LeftNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-shrink-0 border-r border-white/10 bg-slate-950/95 text-sm text-slate-200 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Main
          </p>
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              pathname === item.href || 
              (item.href === "/profile" && pathname.startsWith("/profile")) ||
              (item.href === "/prompts" && pathname.startsWith("/prompts"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary-foreground ring-1 ring-primary/40"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Suspense fallback={
          <div className="space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Profiles
            </p>
            <p className="px-3 text-[11px] text-slate-500">Loading...</p>
          </div>
        }>
          <ProfileList />
        </Suspense>
      </nav>
    </aside>
  );
}

