"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type CategoryCode = "FD6" | "CE7" | "HP8" | "PM9" | "BK9" | "AT4";

const CATEGORIES: { code: CategoryCode; label: string; icon: string; color: string }[] = [
  { code: "FD6", label: "음식점", icon: "🍽️", color: "#EF4444" },
  { code: "CE7", label: "카페", icon: "☕", color: "#92400E" },
  { code: "HP8", label: "병원", icon: "🏥", color: "#2563EB" },
  { code: "PM9", label: "약국", icon: "💊", color: "#16A34A" },
  { code: "BK9", label: "은행", icon: "🏦", color: "#7C3AED" },
  { code: "AT4", label: "관광명소", icon: "📍", color: "#EA580C" },
];

function getCategoryStyle(code: CategoryCode) {
  return CATEGORIES.find((c) => c.code === code) ?? CATEGORIES[0];
}

export function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryCode>("FD6");
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const overlaysRef = useRef<{ overlay: any; el: HTMLDivElement }[]>([]);
  const mapInstanceRef = useRef<any>(null);
  const userPosRef = useRef<any>(null);
  const activeCategoryRef = useRef<CategoryCode>("FD6");
  const lastActionRef = useRef(0);

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
    const defaultPos = new kakao.maps.LatLng(37.5665, 126.978);

    const map = new kakao.maps.Map(mapRef.current, {
      center: defaultPos,
      level: 4,
    });
    mapInstanceRef.current = map;

    kakao.maps.event.addListener(map, "click", () => {
      if (Date.now() - lastActionRef.current < 300) return;
      resetOverlays();
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(userPos);
          userPosRef.current = userPos;

          new kakao.maps.CustomOverlay({
            map,
            position: userPos,
            content: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>`,
            yAnchor: 0.5,
            xAnchor: 0.5,
          });

          searchPlaces(map, userPos, "FD6");
        },
        () => {
          userPosRef.current = defaultPos;
          searchPlaces(map, defaultPos, "FD6");
        }
      );
    }
  }, [loaded]);

  function clearOverlays() {
    overlaysRef.current.forEach((o) => o.overlay.setMap(null));
    overlaysRef.current = [];
  }

  function highlightOverlay(idx: number) {
    lastActionRef.current = Date.now();
    setSelectedIdx(idx);

    const style = getCategoryStyle(activeCategoryRef.current);

    overlaysRef.current.forEach((item, i) => {
      const bubble = item.el.querySelector(".place-bubble") as HTMLElement;
      const nameEl = item.el.querySelector(".place-name") as HTMLElement;
      const arrow = item.el.querySelector(".place-arrow") as HTMLElement;
      if (!bubble || !nameEl || !arrow) return;

      if (i === idx) {
        // 선택: 강조 + 이름 + 화살표
        bubble.style.background = style.color;
        bubble.style.borderColor = style.color;
        bubble.style.boxShadow = `0 4px 12px ${style.color}66`;
        bubble.style.opacity = "1";
        nameEl.style.fontSize = "11px";
        nameEl.style.maxWidth = "140px";
        nameEl.style.opacity = "1";
        nameEl.style.color = "white";
        nameEl.style.marginLeft = "4px";
        arrow.style.borderTopColor = style.color;
        arrow.style.display = "block";
        (item.overlay as any).setZIndex(100);
      } else {
        // 비선택: 연하게
        bubble.style.background = "white";
        bubble.style.borderColor = style.color;
        bubble.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
        bubble.style.opacity = "0.4";
        nameEl.style.fontSize = "0";
        nameEl.style.maxWidth = "0";
        nameEl.style.opacity = "0";
        nameEl.style.marginLeft = "0";
        arrow.style.display = "none";
        (item.overlay as any).setZIndex(1);
      }
    });

    // 센터 이동
    const map = mapInstanceRef.current;
    if (map && overlaysRef.current[idx]) {
      const pos = (overlaysRef.current[idx].overlay as any).getPosition();
      map.setCenter(pos);
      map.panBy(0, 60);
    }
  }

  function resetOverlays() {
    setSelectedIdx(null);
    const style = getCategoryStyle(activeCategoryRef.current);

    overlaysRef.current.forEach((item) => {
      const bubble = item.el.querySelector(".place-bubble") as HTMLElement;
      const nameEl = item.el.querySelector(".place-name") as HTMLElement;
      const arrow = item.el.querySelector(".place-arrow") as HTMLElement;
      if (!bubble || !nameEl || !arrow) return;

      bubble.style.background = "white";
      bubble.style.borderColor = style.color;
      bubble.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
      bubble.style.opacity = "1";
      nameEl.style.fontSize = "0";
      nameEl.style.maxWidth = "0";
      nameEl.style.opacity = "0";
      nameEl.style.marginLeft = "0";
      arrow.style.display = "none";
      (item.overlay as any).setZIndex(1);
    });
  }

  function searchPlaces(map: any, center: any, category: CategoryCode) {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    const style = getCategoryStyle(category);

    clearOverlays();
    setPlaces([]);
    setSelectedIdx(null);

    ps.categorySearch(
      category,
      (data: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK) return;

        setPlaces(data);
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place: any, i: number) => {
          const position = new kakao.maps.LatLng(place.y, place.x);
          bounds.extend(position);

          const el = document.createElement("div");
          el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
          el.innerHTML = `
            <div class="place-bubble" style="display:flex;align-items:center;gap:4px;padding:4px 8px;background:white;border-radius:20px;box-shadow:0 1px 4px rgba(0,0,0,0.12);border:1.5px solid ${style.color};white-space:nowrap;transition:all 0.15s;">
              <span style="font-size:13px;line-height:1;">${style.icon}</span>
              <span class="place-name" style="font-size:0;max-width:0;overflow:hidden;font-weight:600;color:#1a1a1a;transition:all 0.15s;opacity:0;">${place.place_name}</span>
            </div>
            <div class="place-arrow" style="display:none;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${style.color};"></div>
          `;

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            highlightOverlay(i);
          });

          const overlay = new kakao.maps.CustomOverlay({
            map,
            position,
            content: el,
            yAnchor: 1,
            xAnchor: 0.5,
            zIndex: 1,
          });

          overlaysRef.current.push({ overlay, el });
        });

        if (userPosRef.current) bounds.extend(userPosRef.current);
        map.setBounds(bounds);
      },
      {
        location: center,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE,
      }
    );
  }

  function handleCategoryClick(code: CategoryCode) {
    setActiveCategory(code);
    activeCategoryRef.current = code;
    if (mapInstanceRef.current && userPosRef.current) {
      searchPlaces(mapInstanceRef.current, userPosRef.current, code);
    }
  }

  function handlePlaceClick(idx: number) {
    highlightOverlay(idx);
  }

  return (
    <div className="flex h-full flex-col">
      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-white border-b border-zinc-200 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.code}
            onClick={() => handleCategoryClick(cat.code)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat.code
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="flex-1 min-h-0">
        {!loaded && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">지도 로딩 중...</p>
          </div>
        )}
      </div>

      {/* 주변 장소 목록 */}
      {places.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-t border-zinc-200 bg-white">
          {places.map((place, i) => (
            <button
              key={i}
              onClick={() => handlePlaceClick(i)}
              className={`flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors ${
                selectedIdx === i ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-zinc-50"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{place.place_name}</p>
                <p className="text-xs text-zinc-500 truncate">{place.road_address_name || place.address_name}</p>
                {place.phone && (
                  <p className="text-xs text-zinc-400">{place.phone}</p>
                )}
                {place.distance && (
                  <p className="text-xs text-blue-500 font-medium">{Number(place.distance) >= 1000 ? `${(Number(place.distance) / 1000).toFixed(1)}km` : `${place.distance}m`}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
