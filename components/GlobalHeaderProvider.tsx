"use client";

import { useState, useEffect } from "react";
import { GlobalHeader } from "./GlobalHeader";
import { usePathname } from "next/navigation";

export function GlobalHeaderProvider() {
  const pathname = usePathname();
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    const loadReminderCount = async () => {
      try {
        const response = await fetch("/api/interviews");
        const data = await response.json();
        setReminderCount(data.reminderCount || 0);
      } catch (error) {
        console.error("Error loading reminder count:", error);
      }
    };

    loadReminderCount();
    const interval = setInterval(loadReminderCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [pathname]);

  const handleReminderClick = () => {
    // Navigate to dashboard and filter to Reminder stage
    window.location.href = "/dashboard";
  };

  return (
    <GlobalHeader
      reminderCount={reminderCount}
      onReminderClick={handleReminderClick}
    />
  );
}

