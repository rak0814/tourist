"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  is_read: boolean;
}

function highlightText(text: string, query: string, isActive: boolean) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className={`rounded px-0.5 text-inherit ${isActive ? "bg-orange-400/80" : "bg-yellow-300/80"}`}>{part}</mark>
    ) : (
      part
    )
  );
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [otherNickname, setOtherNickname] = useState("상대방");
  const [sending, setSending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (msgId: string, e: ReactTouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ msgId, x: touch.clientX, y: touch.clientY });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setContextMenu(null);
  };

  // 검색 매칭 메시지 ID 목록
  const matchedIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return messages
      .filter((msg) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((msg) => msg.id);
  }, [messages, searchQuery]);

  // 검색어 변경 시 마지막 매칭으로 이동
  useEffect(() => {
    if (matchedIds.length > 0) {
      const lastIndex = matchedIds.length - 1;
      setCurrentMatchIndex(lastIndex);
      scrollToMessage(matchedIds[lastIndex]);
    } else {
      setCurrentMatchIndex(0);
    }
  }, [matchedIds]);

  const scrollToMessage = useCallback((msgId: string) => {
    const el = msgRefs.current.get(msgId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const goToPrev = () => {
    if (matchedIds.length === 0) return;
    const newIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : matchedIds.length - 1;
    setCurrentMatchIndex(newIndex);
    scrollToMessage(matchedIds[newIndex]);
  };

  const goToNext = () => {
    if (matchedIds.length === 0) return;
    const newIndex = currentMatchIndex < matchedIds.length - 1 ? currentMatchIndex + 1 : 0;
    setCurrentMatchIndex(newIndex);
    scrollToMessage(matchedIds[newIndex]);
  };

  // 채팅방 정보 + 메시지 로드
  useEffect(() => {
    if (!user) return;

    const loadRoom = async () => {
      const { data: room } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!room) return;

      const otherId = room.user1_id === user.id ? room.user2_id : room.user1_id;
      const { data: otherUser } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", otherId)
        .single();

      if (otherUser) setOtherNickname(otherUser.nickname);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);

      // 상대방 메시지 읽음 처리
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    };

    loadRoom();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // 상대방 메시지가 들어오면 바로 읽음 처리
          if (newMsg.sender_id !== user.id) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updated.id ? updated : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  // 새 메시지 올 때 자동 스크롤 (검색 중이 아닐 때만)
  useEffect(() => {
    if (!searchOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchOpen]);

  const handleSend = async () => {
    if (!user || !text.trim() || sending) return;
    setSending(true);

    await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: user.id,
      text: text.trim(),
    });

    setText("");
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`;
  };

  const getDateKey = (dateStr: string) => new Date(dateStr).toDateString();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="shrink-0 border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <div className="relative flex h-12 items-center justify-center px-4">
          <button onClick={() => router.push("/chat")} className="absolute left-4 text-zinc-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-base font-semibold">{otherNickname}</h1>
          <button onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }} className="absolute right-4 text-zinc-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
        {searchOpen && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <input
              type="text"
              placeholder="메시지 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 rounded-full bg-zinc-100 px-4 py-1.5 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-900"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-xs text-zinc-500">
              취소
            </button>
          </div>
        )}
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 px-4 py-3 dark:bg-zinc-950">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-zinc-400">메시지를 보내 대화를 시작하세요.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === user.id;
              const isMatch = searchQuery && matchedIds.includes(msg.id);
              const isActiveMatch = isMatch && matchedIds[currentMatchIndex] === msg.id;
              const prevMsg = messages[idx - 1];
              const showDate = !prevMsg || getDateKey(prevMsg.created_at) !== getDateKey(msg.created_at);
              return (
                <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-3">
                    <span className="rounded-full bg-zinc-200/70 px-3 py-1 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {formatDateLabel(msg.created_at)}
                    </span>
                  </div>
                )}
                <div
                  ref={(el) => { if (el) msgRefs.current.set(msg.id, el); }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} ${isActiveMatch ? "scale-[1.02] transition-transform" : ""}`}
                  onTouchStart={(e) => handleTouchStart(msg.id, e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className={`flex max-w-[75%] items-end gap-1.5 ${isMine ? "flex-row-reverse" : ""}`}>
                    {!isMine && (
                      <div className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700">
                        <svg className="h-8 w-8 translate-y-1 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                        isMine
                          ? "rounded-br-sm bg-primary text-white"
                          : "rounded-bl-sm bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
                      } ${isActiveMatch ? "ring-2 ring-orange-400" : ""}`}
                    >
                      {searchQuery && isMatch ? highlightText(msg.text, searchQuery, !!isActiveMatch) : msg.text}
                    </div>
                    <div className={`flex shrink-0 flex-col ${isMine ? "items-end" : "items-start"}`}>
                      {isMine && !msg.is_read && (
                        <span className="text-[10px] font-bold text-primary">1</span>
                      )}
                      <span className="text-[10px] text-zinc-400">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* 메시지 컨텍스트 메뉴 */}
      {contextMenu && (() => {
        const msg = messages.find((m) => m.id === contextMenu.msgId);
        if (!msg) return null;
        const isMine = msg.sender_id === user?.id;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <div
              className="fixed z-50 min-w-[140px] overflow-hidden rounded-xl bg-white shadow-lg dark:bg-zinc-800"
              style={{
                left: Math.min(contextMenu.x, window.innerWidth - 160),
                top: Math.min(contextMenu.y, window.innerHeight - 200),
              }}
            >
              <button onClick={() => handleCopy(msg.text)} className="flex w-full items-center gap-2 px-4 py-3 text-sm active:bg-zinc-100 dark:active:bg-zinc-700">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                복사
              </button>
              <button onClick={() => setContextMenu(null)} className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-3 text-sm active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-700">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                답장
              </button>
              {isMine && (
                <button onClick={() => setContextMenu(null)} className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-3 text-sm active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-700">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                  수정
                </button>
              )}
              <button onClick={() => setContextMenu(null)} className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-3 text-sm text-red-500 active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                삭제
              </button>
            </div>
          </>
        );
      })()}

      {/* 검색 네비게이션 바 */}
      {searchOpen && searchQuery && (
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-zinc-200 bg-background px-4 py-2 pb-[max(0.5rem,var(--safe-area-bottom))] dark:border-zinc-800">
          <button onClick={goToPrev} disabled={matchedIds.length === 0} className="rounded-full p-1.5 text-zinc-500 active:bg-zinc-100 disabled:opacity-30 dark:active:bg-zinc-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <span className="min-w-[3rem] text-center text-xs text-zinc-500">
            {matchedIds.length > 0 ? `${currentMatchIndex + 1}/${matchedIds.length}` : "결과 없음"}
          </span>
          <button onClick={goToNext} disabled={matchedIds.length === 0} className="rounded-full p-1.5 text-zinc-500 active:bg-zinc-100 disabled:opacity-30 dark:active:bg-zinc-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* 메시지 입력 */}
      {!searchOpen && (
        <div className="shrink-0 border-t border-zinc-200 bg-background px-4 py-2 pb-[max(0.5rem,var(--safe-area-bottom))] dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none placeholder:text-zinc-400 dark:bg-zinc-900"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
