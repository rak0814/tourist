import { BottomNav } from "@/components/bottom-nav";

export default function BoardLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">게시판</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="animate-pulse px-4 py-3">
              <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-2 h-3 w-1/2 rounded bg-zinc-50 dark:bg-zinc-800/50" />
            </li>
          ))}
        </ul>
      </main>

      <BottomNav />
    </div>
  );
}
