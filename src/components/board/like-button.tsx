"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const user = useAuthStore((s) => s.user);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
  }, [postId, user]);

  const syncLikes = async () => {
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    const newCount = count ?? 0;
    setLikes(newCount);
    await supabase.from("posts").update({ likes: newCount }).eq("id", postId);
  };

  const handleToggle = async () => {
    if (!user || busyRef.current) return;
    busyRef.current = true;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => prev + (wasLiked ? -1 : 1));

    if (wasLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        setLiked(true);
        setLikes((prev) => prev + 1);
      } else {
        await syncLikes();
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

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
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
        liked
          ? "border-rose-200 text-rose-500 bg-rose-50 dark:border-rose-800 dark:bg-rose-950"
          : "border-zinc-200 text-zinc-500 dark:border-zinc-700"
      }`}
    >
      <svg className="h-4 w-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      좋아요 <span className="font-bold">{likes}</span>
    </button>
  );
}
