import { BottomNav } from "@/components/bottom-nav";
import { HeaderActions } from "@/components/header-actions";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">My App</h1>
        <HeaderActions />
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-zinc-500">여기에 콘텐츠를 추가하세요.</p>
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
