"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";
import { CommentLikeButton } from "./comment-like-button";

function UserAvatar({ small }: { small?: boolean }) {
  const s = small ? "h-6 w-6" : "h-8 w-8";
  const icon = small ? "h-6 w-6" : "h-8 w-8";
  return (
    <div className={`flex ${s} shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700`}>
      <svg className={`${icon} translate-y-1 text-zinc-400 dark:text-zinc-500`} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  user_id: string | null;
  parent_id?: string | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export function CommentItem({
  comment,
  isReply,
}: {
  comment: Comment;
  isReply?: boolean;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const isOwner = user && user.id === comment.user_id;

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    if (error) {
      alert("삭제에 실패했습니다.");
      return;
    }
    router.refresh();
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("comments")
      .update({ text: editText.trim() })
      .eq("id", comment.id);

    if (error) {
      alert("수정에 실패했습니다.");
      return;
    }
    setEditing(false);
    router.refresh();
  };

  return (
    <div className={`py-3 ${isReply ? "pl-3" : ""}`}>
      <div className="flex gap-2.5">
        <div className="mt-0.5">
          <UserAvatar small={isReply} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold">{comment.author}</span>
            <span className="text-xs text-zinc-400">{formatDate(comment.created_at)}</span>
            {isOwner && (
              editing ? (
                <>
                  <button onClick={handleEdit} className="text-xs font-semibold text-blue-500">저장</button>
                  <button onClick={() => { setEditing(false); setEditText(comment.text); }} className="text-xs text-zinc-400">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="text-xs text-zinc-400 hover:text-zinc-600">수정</button>
                  <button onClick={handleDelete} className="text-xs text-zinc-400 hover:text-red-500">삭제</button>
                </>
              )
            )}
          </div>
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none dark:border-zinc-700 dark:bg-transparent"
            />
          ) : (
            <p className="mt-0.5 break-words text-sm leading-snug text-zinc-700 dark:text-zinc-300">{comment.text}</p>
          )}
        </div>
        <div className="mt-0.5 shrink-0">
          <CommentLikeButton commentId={comment.id} initialLikes={comment.likes} />
        </div>
      </div>
    </div>
  );
}
