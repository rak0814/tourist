"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [createdAt, setCreatedAt] = useState("");
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname);

    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.created_at) {
          const d = new Date(data.created_at);
          setCreatedAt(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
        }
      });
  }, [user]);

  const handleNicknameChange = async () => {
    if (!user || !nickname.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ nickname: nickname.trim() })
      .eq("id", user.id);

    if (error) {
      setMessage({ text: "닉네임 변경에 실패했습니다.", type: "error" });
    } else {
      setUser({ ...user, nickname: nickname.trim() });
      setEditingNickname(false);
      setMessage({ text: "닉네임이 변경되었습니다.", type: "success" });
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const handlePasswordChange = async () => {
    if (password.length < 6) {
      setMessage({ text: "비밀번호는 6자 이상이어야 합니다.", type: "error" });
      return;
    }
    if (password !== passwordConfirm) {
      setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setChangingPassword(false);
      setPassword("");
      setPasswordConfirm("");
      setMessage({ text: "비밀번호가 변경되었습니다.", type: "success" });
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("정말 탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다.")) return;

    const { error } = await supabase.rpc("delete_user");
    if (error) {
      alert("탈퇴 처리에 실패했습니다: " + error.message);
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
          <h1 className="text-base font-semibold">마이페이지</h1>
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
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">마이페이지</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* 프로필 영역 */}
        <div className="flex flex-col items-center border-b border-zinc-100 py-8 dark:border-zinc-800">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700">
            <svg className="h-20 w-20 translate-y-2 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="mt-3 text-lg font-bold">{user.nickname}</p>
          <p className="mt-0.5 text-sm text-zinc-400">{user.email}</p>
          {createdAt && <p className="mt-0.5 text-xs text-zinc-300">가입일 {createdAt}</p>}
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`mx-4 mt-4 rounded-lg px-4 py-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-600 dark:bg-green-900/20" : "bg-red-50 text-red-500 dark:bg-red-900/20"}`}>
            {message.text}
          </div>
        )}

        {/* 메뉴 */}
        <div className="px-4 py-4">
          {/* 닉네임 변경 */}
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            {editingNickname ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">닉네임 변경</p>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-transparent"
                />
                <div className="flex gap-2">
                  <button onClick={handleNicknameChange} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    저장
                  </button>
                  <button onClick={() => { setEditingNickname(false); setNickname(user.nickname); }} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingNickname(true)} className="flex w-full items-center justify-between py-1">
                <span className="text-sm">닉네임 변경</span>
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* 비밀번호 변경 */}
          <div className="border-b border-zinc-100 py-4 dark:border-zinc-800">
            {changingPassword ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">비밀번호 변경</p>
                <input
                  type="password"
                  placeholder="새 비밀번호 (6자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-transparent"
                />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-transparent"
                />
                <div className="flex gap-2">
                  <button onClick={handlePasswordChange} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    변경
                  </button>
                  <button onClick={() => { setChangingPassword(false); setPassword(""); setPasswordConfirm(""); }} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setChangingPassword(true)} className="flex w-full items-center justify-between py-1">
                <span className="text-sm">비밀번호 변경</span>
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* 회원탈퇴 */}
          <div className="pt-4">
            <button onClick={handleDeleteAccount} className="text-sm text-red-400">
              회원탈퇴
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
