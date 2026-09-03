"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function ViewCounter({ postId }: { postId: string }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    supabase.rpc("increment_views", { post_id: postId });
  }, [postId]);

  return null;
}
