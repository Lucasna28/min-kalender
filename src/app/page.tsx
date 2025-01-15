"use client";

import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useEffect, useState } from "react";
import CalendarView from "@/components/calendar/calendar-view";

export default function HomePage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          router.push("/calendar");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Fejl ved tjek af bruger:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}
