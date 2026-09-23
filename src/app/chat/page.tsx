"use client";

import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
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
  unreadCount?: number;
}

function SwipeableRoom({ children, onLeave }: { children: React.ReactNode; onLeave: () => void; }) {
  const containerRef = useRef<HTMLLIElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiped = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showBtn, setShowBtn] = useState(false);

  const onTouchStart = (e: ReactTouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
    swiped.current = false;
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    // 왼쪽 스와이프만
    if (diff > 0 && !showBtn) return;
    if (showBtn && diff > 0) {
      // 열린 상태에서 오른쪽 스와이프 → 닫기
      const val = Math.min(diff, 80);
      setOffset(-80 + val);
      currentX.current = diff;
      swiped.current = true;
      return;
    }
    const val = Math.max(diff, -80);
    setOffset(val);
    currentX.current = diff;
    if (Math.abs(diff) > 10) swiped.current = true;
  };

  const onTouchEnd = () => {
    if (showBtn) {
      // 열린 상태
      if (currentX.current > 30) {
        setOffset(0);
        setShowBtn(false);
      } else {
        setOffset(-80);
      }
    } else {
      if (currentX.current < -30) {
        setOffset(-80);
        setShowBtn(true);
      } else {
        setOffset(0);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <li ref={containerRef} className="relative overflow-hidden">
      <div
        className="absolute right-0 top-0 flex h-full w-20 items-center justify-center bg-red-500"
      >
        <button
          onClick={onLeave}
          className="flex flex-col items-center gap-0.5 text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          <span className="text-xs font-semibold">나가기</span>
        </button>
      </div>
      <div
        className="relative"
        style={{ transform: `translateX(${offset}px)`, transition: currentX.current === 0 ? "transform 0.2s ease" : "none" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={handleClick}
      >
        {children}
      </div>
    </li>
  );
}

export default function ChatListPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);

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

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        return {
          ...room,
          otherNickname: otherUser?.nickname ?? "탈퇴한 사용자",
          lastMessage: lastMsg?.text,
          lastMessageTime: lastMsg?.created_at,
          unreadCount: count ?? 0,
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

  const leaveRoom = async (roomId: string) => {
    if (!user) return;
    // 채팅방의 내 메시지를 숨김 처리
    const { data: msgs } = await supabase
      .from("messages")
      .select("id")
      .eq("room_id", roomId);
    if (msgs && msgs.length > 0) {
      const inserts = msgs.map((m) => ({ message_id: m.id, user_id: user.id }));
      await supabase.from("hidden_messages").upsert(inserts, { onConflict: "message_id,user_id" });
    }
    // 채팅방에서 내 ID 제거
    const { data: room } = await supabase.from("chat_rooms").select("user1_id, user2_id").eq("id", roomId).single();
    if (room) {
      if (room.user1_id === user.id) {
        await supabase.from("chat_rooms").update({ user1_id: null }).eq("id", roomId);
      } else {
        await supabase.from("chat_rooms").update({ user2_id: null }).eq("id", roomId);
      }
      // 둘 다 나갔으면 채팅방 삭제
      const updated = room.user1_id === user.id ? { ...room, user1_id: null } : { ...room, user2_id: null };
      if (!updated.user1_id && !updated.user2_id) {
        await supabase.from("messages").delete().eq("room_id", roomId);
        await supabase.from("chat_rooms").delete().eq("id", roomId);
      }
    }
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
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
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
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
      <header className="shrink-0 border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <div className="relative flex h-12 items-center justify-center px-4">
          <h1 className="text-base font-semibold">채팅</h1>
          <button
            onClick={() => setShowNewChat((v) => !v)}
            className="absolute right-4 text-zinc-500 active:text-zinc-800 dark:active:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {showNewChat ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              )}
            </svg>
          </button>
        </div>
        {showNewChat && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="상대방 이메일로 채팅 시작"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") startChat();
                }}
                autoFocus
                className="w-full rounded-full bg-zinc-100 px-4 py-1.5 pr-8 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-900"
              />
              {searchEmail && (
                <button onClick={() => setSearchEmail("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={startChat}
              disabled={!searchEmail.trim()}
              className="shrink-0 text-sm font-semibold text-primary"
            >
              시작
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">

        {/* 채팅방 목록 */}
        {loading ? (
          <p className="py-10 text-center text-sm text-zinc-400">로딩 중...</p>
        ) : rooms.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">채팅방이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rooms.map((room) => (
              <SwipeableRoom key={room.id} onLeave={() => setLeaveTarget(room.id)}>
                <button
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="flex w-full items-center gap-3 bg-background px-4 py-2 text-left active:bg-zinc-50 dark:active:bg-zinc-900"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700">
                    <svg className="h-10 w-10 translate-y-1 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-semibold ${room.otherNickname === "탈퇴한 사용자" ? "text-zinc-400" : ""}`}>{room.otherNickname}</span>
                        <p className="mt-0.5 text-xs leading-normal text-zinc-400" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {room.lastMessage ?? "메시지가 없습니다"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                        {room.lastMessageTime && (
                          <span className="text-xs text-zinc-400">{formatTime(room.lastMessageTime)}</span>
                        )}
                        {(room.unreadCount ?? 0) > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </SwipeableRoom>
            ))}
          </ul>
        )}
      </main>

      {/* 나가기 확인 팝업 */}
      {leaveTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setLeaveTarget(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold">채팅방 나가기</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              채팅방을 나가면 대화 내용이 모두 삭제되며 복구할 수 없습니다.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setLeaveTarget(null)}
                className="flex-1 rounded-lg bg-zinc-100 py-3 text-sm font-semibold dark:bg-zinc-800 dark:text-zinc-300"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await leaveRoom(leaveTarget);
                  setLeaveTarget(null);
                }}
                className="flex-1 rounded-lg bg-red-500 py-3 text-sm font-semibold text-white"
              >
                나가기
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
