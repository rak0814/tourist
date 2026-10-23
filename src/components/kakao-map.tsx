"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type CategoryCode = "FD6" | "CE7" | "HP8" | "PM9" | "BK9" | "AT4";

const CATEGORIES: { code: CategoryCode; label: string }[] = [
  { code: "FD6", label: "음식점" },
  { code: "CE7", label: "카페" },
  { code: "HP8", label: "병원" },
  { code: "PM9", label: "약국" },
  { code: "BK9", label: "은행" },
  { code: "AT4", label: "관광명소" },
];

export function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryCode>("FD6");
  const [places, setPlaces] = useState<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const mapInstanceRef = useRef<any>(null);
  const userPosRef = useRef<any>(null);

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(userPos);
          userPosRef.current = userPos;

          // 현재 위치 마커 (파란 원)
          new kakao.maps.CustomOverlay({
            map,
            position: userPos,
            content: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>`,
            yAnchor: 0.5,
            xAnchor: 0.5,
          });

          // 초기 검색
          searchPlaces(map, userPos, "FD6");
        },
        () => {
          userPosRef.current = defaultPos;
          searchPlaces(map, defaultPos, "FD6");
        }
      );
    }
  }, [loaded]);

  function clearMarkers() {
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];
  }

  function searchPlaces(map: any, center: any, category: CategoryCode) {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();

    clearMarkers();
    setPlaces([]);

    ps.categorySearch(
      category,
      (data: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK) return;

        setPlaces(data);
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place: any) => {
          const position = new kakao.maps.LatLng(place.y, place.x);
          bounds.extend(position);

          const marker = new kakao.maps.Marker({ map, position });
          markersRef.current.push(marker);

          const overlay = new kakao.maps.CustomOverlay({
            content: `<div style="padding:4px 8px;background:white;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.15);font-size:12px;font-weight:500;white-space:nowrap;border:1px solid #e4e4e7;">${place.place_name}</div>`,
            position,
            yAnchor: 2.2,
          });
          overlaysRef.current.push(overlay);

          kakao.maps.event.addListener(marker, "click", () => {
            overlaysRef.current.forEach((o) => o.setMap(null));
            overlay.setMap(map);
          });
        });

        // 현재 위치도 bounds에 포함
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
    if (mapInstanceRef.current && userPosRef.current) {
      searchPlaces(mapInstanceRef.current, userPosRef.current, code);
    }
  }

  function handlePlaceClick(place: any) {
    if (!mapInstanceRef.current) return;
    const { kakao } = window;
    const position = new kakao.maps.LatLng(place.y, place.x);
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setLevel(3);

    overlaysRef.current.forEach((o) => o.setMap(null));
    const idx = places.indexOf(place);
    if (idx >= 0 && overlaysRef.current[idx]) {
      overlaysRef.current[idx].setMap(mapInstanceRef.current);
    }
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
              onClick={() => handlePlaceClick(place)}
              className="flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
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
