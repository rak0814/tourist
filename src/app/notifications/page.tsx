"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

interface Notification {
  id: string;
  actor_name: string;
  type: string;
  post_id: string;
  post_title: string;
  created_at: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function typeLabel(type: string) {
  switch (type) {
    case "like": return "게시글에 좋아요를 눌렀습니다.";
    case "comment_like": return "댓글에 좋아요를 눌렀습니다.";
    case "reply_like": return "답글에 좋아요를 눌렀습니다.";
    case "comment": return "댓글을 달았습니다.";
    case "reply": return "답글을 달았습니다.";
    default: return "";
  }
}

function TypeIcon({ type }: { type: string }) {
  if (type === "like" || type === "comment_like" || type === "reply_like") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
        <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
      </svg>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    setNotifications(data ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteAll = async () => {
    if (!user || !confirm("알림을 모두 삭제하시겠습니까?")) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <button onClick={() => router.back()} className="absolute left-4 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold">알림</h1>
        {notifications.length > 0 && (
          <button onClick={handleDeleteAll} className="absolute right-4 text-xs text-zinc-400">
            전체삭제
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="py-10 text-center text-sm text-zinc-400">로딩 중...</p>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">알림이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.map((noti) => (
              <li key={noti.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => router.push(`/board/${noti.post_id}`)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <TypeIcon type={noti.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{noti.actor_name}</span>
                      <span className="text-zinc-600 dark:text-zinc-400">님이 {typeLabel(noti.type)}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">{noti.post_title}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-zinc-400">{formatTime(noti.created_at)}</span>
                </button>
                <button
                  onClick={() => handleDelete(noti.id)}
                  className="shrink-0 text-zinc-300 hover:text-zinc-500 dark:text-zinc-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
