"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async () => {
    if (!password.trim() || password.length < 6) {
      setMessage({ text: "비밀번호는 6자 이상이어야 합니다.", type: "error" });
      return;
    }
    if (password !== confirm) {
      setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "비밀번호가 변경되었습니다.", type: "success" });
      setTimeout(() => router.push("/login"), 1500);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">비밀번호 재설정</h1>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-transparent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호 다시 입력"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-zinc-700 dark:bg-transparent"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>
      </main>
    </div>
  );
}
