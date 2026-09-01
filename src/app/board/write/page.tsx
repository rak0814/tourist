"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export default function WritePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          author: user.nickname,
          user_id: user.id,
        });

      if (error) {
        alert("등록 실패: " + error.message);
        setSubmitting(false);
        return;
      }

      router.push("/board");
      router.refresh();
    } catch (e) {
      alert("오류 발생: " + e);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <Link href="/board" className="text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">글쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="text-sm font-semibold text-blue-500 disabled:text-zinc-300"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4 gap-3">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-zinc-200 pb-3 text-base font-semibold outline-none placeholder:text-zinc-300 dark:border-zinc-800 dark:bg-transparent"
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full flex-1 resize-none text-sm leading-relaxed outline-none placeholder:text-zinc-300 dark:bg-transparent"
        />
      </main>
    </div>
  );
}
