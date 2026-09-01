import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CommentSection } from "@/components/board/comment-section";
import { PostActions } from "@/components/board/post-actions";
import { LikeButton } from "@/components/board/like-button";
import { CommentItem } from "@/components/board/comment-item";

export const revalidate = 0;

function UserAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`flex ${s} shrink-0 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700`}>
      <svg className={`${icon} text-zinc-400`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    </div>
  );
}

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 조회수 증가
  await supabase.rpc("increment_views", { post_id: id }).then(() => {});

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <Link href="/board" className="absolute left-4 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">게시글</h1>
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {/* 작성자 정보 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <UserAvatar />
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-xs text-zinc-400">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <PostActions postId={post.id} postUserId={post.user_id} />
        </div>

        {/* 본문 */}
        <div className="px-4 pb-4">
          <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{post.content}</p>
        </div>

        {/* 좋아요 버튼 */}
        <div className="flex justify-center border-b border-zinc-100 px-4 pb-4 dark:border-zinc-800">
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </div>

        {/* 댓글 영역 */}
        <div className="px-4 py-3">
          <p className="text-sm font-bold">댓글 {comments?.length ?? 0}</p>

          {!comments || comments.length === 0 ? (
            <p className="mt-4 text-center text-xs text-zinc-300">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* 댓글 입력 */}
      <CommentSection postId={post.id} />
    </div>
  );
}
