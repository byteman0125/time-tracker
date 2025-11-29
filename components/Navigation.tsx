"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/prompts", label: "Prompts", icon: MessageSquare },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold">
            Interview Tracker
          </Link>
          <div className="flex gap-2 ml-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(isActive && "bg-primary")}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

