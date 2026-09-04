"use client";

import { useState } from "react";
import { BoardSearchButton, BoardSearchBar } from "./board-search";

export function BoardHeader({ searchQuery }: { searchQuery?: string }) {
  const [searchOpen, setSearchOpen] = useState(!!searchQuery);

  return (
    <header className="shrink-0 border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
      <div className="relative flex h-12 items-center justify-center px-4">
        <h1 className="text-base font-semibold">게시판</h1>
        <BoardSearchButton onOpen={() => setSearchOpen(true)} />
      </div>
      {searchOpen && (
        <BoardSearchBar onClose={() => setSearchOpen(false)} />
      )}
    </header>
  );
}
