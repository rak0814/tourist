"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function BoardHeader({ searchQuery }: { searchQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(searchQuery ?? "");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/board?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/board");
    }
    setSearchOpen(false);
  };

  const handleClose = () => {
    setQuery("");
    router.push("/board");
    setSearchOpen(false);
  };

  return (
    <>
      <header className="shrink-0 border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <div className="relative flex h-12 items-center justify-center px-4">
          <h1 className="text-base font-semibold">게시판</h1>
          <button onClick={() => { setSearchOpen(true); setQuery(searchParams.get("q") ?? ""); }} className="absolute right-4 text-zinc-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
      </header>

      {searchOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold">게시글 검색</h2>
            <input
              type="text"
              placeholder="제목 또는 내용으로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
              className="mt-4 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-zinc-800"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg bg-zinc-100 py-3 text-sm font-semibold dark:bg-zinc-800 dark:text-zinc-300"
              >
                취소
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white"
              >
                검색
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
