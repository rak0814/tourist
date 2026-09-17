"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function VisitLogger() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    supabase.from("visit_logs").insert({ user_id: user.id });
  }, [user]);

  return null;
}
