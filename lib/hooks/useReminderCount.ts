import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useReminderCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    // Initial load
    async function loadCount() {
      try {
        const response = await fetch("/api/interviews");
        const data = await response.json();
        setCount(data.reminderCount || 0);
      } catch (error) {
        console.error("Error loading reminder count:", error);
      }
    }

    loadCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("reminder-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interviews",
        },
        () => {
          // Reload count on any interview change
          loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}

