"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function CommentLikeButton({ commentId, initialLikes }: { commentId: string; initialLikes: number }) {
  const user = useAuthStore((s) => s.user);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
  }, [commentId, user]);

  const syncLikes = async () => {
    const { count } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    const newCount = count ?? 0;
    setLikes(newCount);
    await supabase.from("comments").update({ likes: newCount }).eq("id", commentId);
  };

  const handleToggle = async () => {
    if (!user || busyRef.current) return;
    busyRef.current = true;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => prev + (wasLiked ? -1 : 1));

    if (wasLiked) {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);

      if (error) {
        setLiked(true);
        setLikes((prev) => prev + 1);
      } else {
        await syncLikes();
      }
    } else {
      const { error } = await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: user.id });

      if (error) {
        setLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        await syncLikes();
      }
    }

    busyRef.current = false;
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!user}
      className="flex shrink-0 flex-col items-center gap-0.5 text-zinc-400 disabled:opacity-40"
    >
      <svg
        className={`h-4 w-4 ${liked ? "text-rose-500" : ""}`}
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      <span className={`text-[11px] font-bold ${liked ? "text-rose-500" : ""}`}>{likes}</span>
    </button>
  );
}
