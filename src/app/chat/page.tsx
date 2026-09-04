"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  otherNickname?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export default function ChatListPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadRooms();
  }, [user]);

  const loadRooms = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("chat_rooms")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!data) {
      setLoading(false);
      return;
    }

    // 상대방 닉네임 + 마지막 메시지 조회
    const enriched = await Promise.all(
      data.map(async (room) => {
        const otherId = room.user1_id === user.id ? room.user2_id : room.user1_id;

        const { data: otherUser } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", otherId)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("text, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...room,
          otherNickname: otherUser?.nickname ?? "사용자",
          lastMessage: lastMsg?.text,
          lastMessageTime: lastMsg?.created_at,
        };
      })
    );

    setRooms(enriched);
    setLoading(false);
  };

  const startChat = async () => {
    if (!user || !searchEmail.trim()) return;

    // 이메일로 상대방 찾기
    const { data: otherUser } = await supabase
      .from("profiles")
      .select("id, nickname")
      .eq("email", searchEmail.trim())
      .single();

    if (!otherUser) {
      alert("해당 이메일의 사용자를 찾을 수 없습니다.");
      return;
    }

    if (otherUser.id === user.id) {
      alert("자기 자신에게는 채팅할 수 없습니다.");
      return;
    }

    // 기존 채팅방 확인
    const { data: existing } = await supabase
      .from("chat_rooms")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUser.id}),and(user1_id.eq.${otherUser.id},user2_id.eq.${user.id})`
      )
      .single();

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from("chat_rooms")
      .insert({ user1_id: user.id, user2_id: otherUser.id })
      .select("id")
      .single();

    if (error) {
      alert("채팅방 생성에 실패했습니다.");
      return;
    }

    router.push(`/chat/${newRoom.id}`);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
          <h1 className="text-base font-semibold">채팅</h1>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-zinc-400">로그인 후 이용할 수 있습니다.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-3 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
            >
              로그인
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">채팅</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* 새 채팅 시작 */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <input
            type="email"
            placeholder="상대방 이메일로 채팅 시작"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startChat()}
            className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-800"
          />
          <button
            onClick={startChat}
            disabled={!searchEmail.trim()}
            className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            시작
          </button>
        </div>

        {/* 채팅방 목록 */}
        {loading ? (
          <p className="py-10 text-center text-sm text-zinc-400">로딩 중...</p>
        ) : rooms.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">채팅방이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-zinc-50 dark:active:bg-zinc-900"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700">
                    <svg className="h-10 w-10 translate-y-1 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{room.otherNickname}</span>
                      {room.lastMessageTime && (
                        <span className="text-xs text-zinc-400">{formatTime(room.lastMessageTime)}</span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                      {room.lastMessage ?? "메시지가 없습니다"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
