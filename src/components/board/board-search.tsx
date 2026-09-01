"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function BoardSearch() {
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

  const handleClear = () => {
    setQuery("");
    router.push("/board");
  };

  return (
    <div className="relative px-4 py-2">
      <input
        type="text"
        placeholder="제목 또는 내용으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="w-full rounded-lg bg-zinc-100 py-2 pl-4 pr-16 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-800"
      />
      <div className="absolute right-7 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {query && (
          <button onClick={handleClear} className="text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button onClick={handleSearch} className="text-zinc-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
