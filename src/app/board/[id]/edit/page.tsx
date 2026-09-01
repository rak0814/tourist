"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("posts")
      .select("title, content")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("posts")
      .update({ title: title.trim(), content: content.trim() })
      .eq("id", id);

    if (error) {
      alert("수정에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    router.push(`/board/${id}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <Link href={`/board/${id}`} className="absolute left-4 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">수정</h1>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="absolute right-4 text-sm font-semibold text-blue-500 disabled:text-zinc-300"
        >
          {submitting ? "저장 중..." : "저장"}
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
