import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CommentItem } from "@/components/board/comment-item";
import { ReplyInput } from "@/components/board/reply-input";

export const revalidate = 0;

export default async function CommentDetailPage({
  params,
}: {
  params: Promise<{ id: string; commentId: string }>;
}) {
  const { id, commentId } = await params;

  const { data: comment } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (!comment) notFound();

  const { data: replies } = await supabase
    .from("comments")
    .select("*")
    .eq("parent_id", commentId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <Link href={`/board/${id}`} className="absolute left-4 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">답글</h1>
      </header>

      {/* 콘텐츠 */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        {/* 원댓글 */}
        <div className="border-b border-zinc-100 px-4 dark:border-zinc-800">
          <CommentItem comment={comment} />
        </div>

        {/* 답글 목록 */}
        <div className="px-4">
          {(replies ?? []).length === 0 ? (
            <p className="mt-8 text-center text-xs text-zinc-300">아직 답글이 없습니다.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(replies ?? []).map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 답글 입력 (하단 고정) */}
      <ReplyInput postId={id} parentId={commentId} isFixed />
    </div>
  );
}
