import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { BoardList } from "@/components/board/board-list";
import { BoardSearch } from "@/components/board/board-search";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  let query = supabase
    .from("posts")
    .select("*, comments(count)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data: posts } = await query;

  const formatted = (posts ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author,
    date: new Date(post.created_at).toLocaleDateString("ko-KR"),
    views: post.views,
    likes: post.likes,
    commentCount: post.comments?.[0]?.count ?? 0,
  }));

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">게시판</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <BoardSearch />
        {formatted.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">
            {q ? "검색 결과가 없습니다." : "게시글이 없습니다."}
          </p>
        ) : (
          <BoardList posts={formatted} />
        )}
      </main>

      <Link
        href="/board/write"
        className="absolute bottom-20 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg active:scale-95 transition-transform"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </Link>

      <BottomNav />
    </div>
  );
}
