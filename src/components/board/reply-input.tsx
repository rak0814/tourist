"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function ReplyInput({ postId, parentId }: { postId: string; parentId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        text: text.trim(),
        author: user.nickname,
        user_id: user.id,
        parent_id: parentId,
      });

    if (error) {
      alert("답글 등록에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    setText("");
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="ml-10 flex items-center gap-2 border-l border-zinc-100 py-2 pl-3 dark:border-zinc-800">
      <input
        type="text"
        placeholder="답글을 입력하세요"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="flex-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-900"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </button>
    </div>
  );
}
