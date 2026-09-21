"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

declare global {
  interface Window {
    kakao: any;
  }
}

function getLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { kakao } = window;
        if (!kakao?.maps?.services) return resolve(null);

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(pos.coords.longitude, pos.coords.latitude, (result: any[], status: string) => {
          if (status === kakao.maps.services.Status.OK) {
            const region = result.find((r: any) => r.region_type === "H");
            if (region) {
              resolve(region.region_3depth_name || region.region_2depth_name);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      },
      () => resolve(null)
    );
  });
}

export default function WritePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // 카카오 SDK 로드 (services 라이브러리 포함)
  useEffect(() => {
    if (window.kakao?.maps?.services) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => setSdkLoaded(true));
    };
    document.head.appendChild(script);
  }, []);

  // SDK 로드 후 위치 가져오기
  useEffect(() => {
    if (!sdkLoaded) return;
    getLocation().then((loc) => setLocation(loc));
  }, [sdkLoaded]);

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          author: user.nickname,
          user_id: user.id,
          location,
        });

      if (error) {
        alert("등록 실패: " + error.message);
        setSubmitting(false);
        return;
      }

      router.push("/board");
      router.refresh();
    } catch (e) {
      alert("오류 발생: " + e);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <Link href="/board" className="absolute left-4 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">글쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="absolute right-4 text-sm font-semibold text-primary disabled:text-zinc-300"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4 gap-3">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-zinc-200 pb-3 text-base font-semibold outline-none placeholder:text-zinc-300 dark:border-zinc-800 dark:bg-transparent"
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full flex-1 resize-none text-sm leading-relaxed outline-none placeholder:text-zinc-300 dark:bg-transparent"
        />
      </main>
    </div>
  );
}
