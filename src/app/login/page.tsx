"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tab = "login" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // 로그인
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입
  const [nickname, setNickname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 비밀번호 찾기
  const [forgotEmail, setForgotEmail] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setMessage({ text: "이메일 또는 비밀번호가 올바르지 않습니다.", type: "error" });
    } else {
      router.push("/");
    }
    setSubmitting(false);
  };

  const handleSignup = async () => {
    if (!nickname.trim() || !signupEmail.trim() || !signupPassword.trim()) return;
    if (signupPassword !== signupPasswordConfirm) {
      setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setMessage({ text: "이용약관과 개인정보처리방침에 모두 동의해주세요.", type: "error" });
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: { data: { nickname: nickname.trim() } },
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setMessage({ text: "이미 가입된 이메일입니다.", type: "error" });
    } else if (data.session) {
      router.push("/");
    } else {
      setMessage({ text: "회원가입 완료! 로그인해주세요.", type: "success" });
      setTab("login");
    }
    setSubmitting(false);
  };

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return;
    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "비밀번호 재설정 메일을 보냈습니다.\n이메일을 확인하세요.", type: "success" });
    }
    setSubmitting(false);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setMessage(null);
  };

  const inputClass =
    "mt-1.5 w-full rounded-[10px] border-[1.5px] border-[#e0e0e0] bg-[#fafafa] px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-primary dark:focus:bg-zinc-900";

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-[#f5f5f5] px-5 py-10 dark:bg-black">
      <div className="w-full max-w-[400px]">
        {/* 로고 헤더 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-extrabold text-white">
            M
          </div>
          <h1 className="text-[22px] font-bold text-[#111] dark:text-zinc-100">My App</h1>
          <p className="mt-1 text-[13px] text-[#888]">
            {tab === "forgot" ? "가입한 이메일을 입력하세요" : "이메일로 간편하게 시작하세요"}
          </p>
        </div>

        {/* 카드 */}
        <div className="rounded-2xl bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900">
          {/* 탭 */}
          {tab !== "forgot" && (
            <div className="mb-6 flex rounded-[10px] bg-[#f0f0f0] p-[3px] dark:bg-zinc-800">
              <button
                onClick={() => switchTab("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  tab === "login"
                    ? "bg-white text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.1)] dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-[#888]"
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  tab === "signup"
                    ? "bg-white text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.1)] dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-[#888]"
                }`}
              >
                회원가입
              </button>
            </div>
          )}

          {/* 로그인 폼 */}
          {tab === "login" && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">이메일</label>
                <input type="email" placeholder="example@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">비밀번호</label>
                <input type="password" placeholder="6자 이상 입력하세요" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />
              </div>
              <button
                onClick={handleLogin}
                disabled={!loginEmail.trim() || !loginPassword.trim() || submitting}
                className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                로그인
              </button>
              <button onClick={() => switchTab("forgot")} className="mt-3 block w-full text-center text-[13px] text-primary hover:underline">
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {/* 회원가입 폼 */}
          {tab === "signup" && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">닉네임</label>
                <input type="text" placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">이메일</label>
                <input type="email" placeholder="example@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">비밀번호</label>
                <input type="password" placeholder="6자 이상 입력하세요" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">비밀번호 확인</label>
                <input type="password" placeholder="비밀번호를 다시 입력하세요" value={signupPasswordConfirm} onChange={(e) => setSignupPasswordConfirm(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#555] dark:text-zinc-400">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-[18px] w-[18px] accent-primary" />
                  <span><a href="/terms" target="_blank" className="text-primary underline">이용약관</a>에 동의합니다 (필수)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#555] dark:text-zinc-400">
                  <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="h-[18px] w-[18px] accent-primary" />
                  <span><a href="/privacy" target="_blank" className="text-primary underline">개인정보처리방침</a>에 동의합니다 (필수)</span>
                </label>
              </div>
              <button
                onClick={handleSignup}
                disabled={!nickname.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupPasswordConfirm.trim() || submitting}
                className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                회원가입
              </button>
            </div>
          )}

          {/* 비밀번호 찾기 폼 */}
          {tab === "forgot" && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#333] dark:text-zinc-300">이메일</label>
                <input type="email" placeholder="example@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} />
              </div>
              <button
                onClick={handleForgot}
                disabled={!forgotEmail.trim() || submitting}
                className="mt-2 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                비밀번호 재설정 메일 보내기
              </button>
              <button onClick={() => switchTab("login")} className="mt-3 block w-full text-center text-[13px] text-primary hover:underline">
                로그인으로 돌아가기
              </button>
            </div>
          )}

          {/* 메시지 */}
          {message && (
            <div
              className={`mt-4 rounded-[10px] p-3 text-center text-[13px] ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message.text.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < message.text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
