"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export function PostActions({ postId, postUserId }: { postId: string; postUserId: string | null }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // 본인 글이 아니면 버튼 숨김
  if (!user || user.id !== postUserId) return null;

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("삭제에 실패했습니다.");
      return;
    }

    router.push("/board");
    router.refresh();
  };

  const handleEdit = () => {
    router.push(`/board/${postId}/edit`);
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleEdit} className="rounded-md border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700">수정</button>
      <button onClick={handleDelete} className="rounded-md border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700">삭제</button>
    </div>
  );
}
