import { BottomNav } from "@/components/bottom-nav";
import { HeaderActions } from "@/components/header-actions";
import { KakaoMap } from "@/components/kakao-map";
import { VisitLogger } from "@/components/visit-logger";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">{APP_NAME}</h1>
        <HeaderActions />
      </header>

      {/* 지도 */}
      <main className="min-h-0 flex-1">
        <VisitLogger />
        <KakaoMap />
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
