import { BottomNav } from "@/components/bottom-nav";

export default function SearchPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">검색</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-zinc-500">검색 페이지</p>
      </main>

      <BottomNav />
    </div>
  );
}
