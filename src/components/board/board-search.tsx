"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function BoardSearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="absolute right-4 text-zinc-500">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </button>
  );
}

export function BoardSearchBar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/board?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/board");
    }
  };

  const handleClose = () => {
    setQuery("");
    router.push("/board");
    onClose();
  };

  return (
    <div className="flex items-center gap-2 px-4 pb-2">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="제목 또는 내용으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          autoFocus
          className="w-full rounded-full bg-zinc-100 px-4 py-1.5 pr-8 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-900"
        />
        {query && (
          <button onClick={() => { setQuery(""); router.push("/board"); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button onClick={handleSearch} className="shrink-0 text-sm font-semibold text-primary">
        검색
      </button>
    </div>
  );
}
