"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const infoItems = [
  { label: "공지사항", icon: MegaphoneIcon },
  { label: "알림", icon: BellIcon },
  { label: "업데이트", icon: SparklesIcon },
];

const supportItems = [
  { label: "문의하기", icon: MailIcon, href: "" },
  { label: "도움말", icon: QuestionIcon, href: "" },
  { label: "이용약관", icon: DocIcon, href: "/terms" },
  { label: "개인정보처리방침", icon: ShieldIcon, href: "/privacy" },
];

const etcItems = [
  { label: "앱 정보", icon: InfoIcon },
  { label: "내정보", icon: PersonIcon },
];

export function SideMenu({ open, onClose }: SideMenuProps) {
  const user = useAuthStore((s) => s.user);

  // 열릴 때 스크롤 방지
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* 사이드 패널 */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform dark:bg-zinc-900 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 상단 프로필 */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <svg className="h-10 w-10 translate-y-1 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold">{user?.nickname ?? "게스트"}</p>
              <p className="text-xs text-zinc-400">{user?.email ?? "로그인해주세요"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[11px] font-semibold text-zinc-400">INFO</p>
          <ul className="mt-2 space-y-1">
            {infoItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <Icon className="h-5 w-5 text-zinc-400" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[11px] font-semibold text-zinc-400">SUPPORT</p>
          <ul className="mt-2 space-y-1">
            {supportItems.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <a href={href} onClick={onClose} className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-400" />
                    {label}
                  </a>
                ) : (
                  <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-400" />
                    {label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <ul className="space-y-1">
              {etcItems.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-400" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 통계 */}
        <div className="border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500 dark:border-zinc-800">
          <p>오늘 접속자 <span className="font-semibold text-foreground">0</span></p>
          <p className="mt-0.5">누적 접속자 <span className="font-semibold text-foreground">0</span></p>
          <p className="mt-0.5">총 회원수 <span className="font-semibold text-foreground">0</span></p>
        </div>
      </div>
    </>
  );
}

/* 아이콘 컴포넌트들 */
function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 0 1-1.006-.275 11.708 11.708 0 0 1-1.005-2.097m2.146-8.282c-.69-.06-1.387-.09-2.09-.09H7.5a4.5 4.5 0 0 0 0 9h.75c.703 0 1.4.03 2.09.09m0-9.18a25.03 25.03 0 0 1 3.41-.903C15.37 4.27 16.5 5.29 16.5 6.6V8.4c0 1.31-1.13 2.33-2.75 2.52a25.03 25.03 0 0 1-3.41-.903" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
