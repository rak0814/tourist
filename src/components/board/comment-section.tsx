"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function CommentSection({ postId }: { postId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        text: text.trim(),
        author: user.nickname,
        user_id: user.id,
      });

    if (error) {
      alert("댓글 등록에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    setText("");
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="shrink-0 border-t border-zinc-200 px-4 py-2 pb-[max(0.5rem,var(--safe-area-bottom))] dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={user ? "댓글을 입력하세요" : "로그인 후 댓글을 작성하세요"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={!user}
          className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none placeholder:text-zinc-400 disabled:opacity-50 dark:bg-zinc-900"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || !user || submitting}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
