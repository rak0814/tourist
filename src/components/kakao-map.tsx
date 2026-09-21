"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // SDK 로드
  useEffect(() => {
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => setLoaded(true));
    };
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const { kakao } = window;

    // 기본 위치 (서울 시청)
    const defaultPos = new kakao.maps.LatLng(37.5665, 126.978);

    const map = new kakao.maps.Map(mapRef.current, {
      center: defaultPos,
      level: 3,
    });

    // 현재 위치로 이동
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(userPos);

          // 현재 위치 마커
          new kakao.maps.Marker({
            map,
            position: userPos,
          });
        },
        () => {
          // 위치 권한 거부 시 기본 위치 유지
        }
      );
    }
  }, [loaded]);

  return (
    <div ref={mapRef} className="h-full w-full">
      {!loaded && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-zinc-400">지도 로딩 중...</p>
        </div>
      )}
    </div>
  );
}
