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

// ~40m 이내 장소는 같은 클러스터로 묶음
const CLUSTER_THRESHOLD = 0.0004;

type ClusterGroup = {
  items: { place: any; globalIdx: number }[];
  lat: number;
  lng: number;
};

function buildClusters(data: any[]): ClusterGroup[] {
  const used = new Set<number>();
  const clusters: ClusterGroup[] = [];

  for (let i = 0; i < data.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const items = [{ place: data[i], globalIdx: i }];

    for (let j = i + 1; j < data.length; j++) {
      if (used.has(j)) continue;
      if (
        Math.abs(Number(data[i].y) - Number(data[j].y)) < CLUSTER_THRESHOLD &&
        Math.abs(Number(data[i].x) - Number(data[j].x)) < CLUSTER_THRESHOLD
      ) {
        items.push({ place: data[j], globalIdx: j });
        used.add(j);
      }
    }

    const avgLat = items.reduce((s, it) => s + Number(it.place.y), 0) / items.length;
    const avgLng = items.reduce((s, it) => s + Number(it.place.x), 0) / items.length;
    clusters.push({ items, lat: avgLat, lng: avgLng });
  }

  return clusters;
}

export function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryCode>("FD6");
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const clusterOverlaysRef = useRef<any[]>([]);
  const popupOverlayRef = useRef<any>(null);
  const highlightOverlayRef = useRef<any>(null);
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
      closePopup();
      clearHighlight();
      setSelectedIdx(null);
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

  function clearAll() {
    clusterOverlaysRef.current.forEach((o) => o.setMap(null));
    clusterOverlaysRef.current = [];
    closePopup();
    clearHighlight();
  }

  function closePopup() {
    if (popupOverlayRef.current) {
      popupOverlayRef.current.setMap(null);
      popupOverlayRef.current = null;
    }
  }

  function clearHighlight() {
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.setMap(null);
      highlightOverlayRef.current = null;
    }
  }

  function selectPlace(place: any, globalIdx: number) {
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    lastActionRef.current = Date.now();
    closePopup();
    clearHighlight();
    setSelectedIdx(globalIdx);

    const style = getCategoryStyle(activeCategoryRef.current);
    const position = new kakao.maps.LatLng(place.y, place.x);

    // 강조 오버레이 생성 (말풍선 + 화살표)
    const el = document.createElement("div");
    el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;padding:5px 12px;background:${style.color};border-radius:20px;box-shadow:0 4px 12px ${style.color}66;border:1.5px solid ${style.color};white-space:nowrap;">
        <span style="font-size:13px;line-height:1;">${style.icon}</span>
        <span style="font-size:11px;font-weight:600;color:white;max-width:140px;overflow:hidden;text-overflow:ellipsis;">${place.place_name}</span>
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${style.color};"></div>
    `;

    const overlay = new kakao.maps.CustomOverlay({
      map,
      position,
      content: el,
      yAnchor: 1,
      xAnchor: 0.5,
      zIndex: 100,
    });
    highlightOverlayRef.current = overlay;

    // 센터 잡고 하단 리스트만큼 위로 올림 (픽셀 단위라 줌 레벨 무관)
    map.setCenter(position);
    map.panBy(0, 60);
  }

  function showClusterPopup(cluster: ClusterGroup) {
    const { kakao } = window;
    const map = mapInstanceRef.current;
    if (!map) return;

    closePopup();
    clearHighlight();
    setSelectedIdx(null);

    const style = getCategoryStyle(activeCategoryRef.current);
    const position = new kakao.maps.LatLng(cluster.lat, cluster.lng);

    const el = document.createElement("div");
    el.style.cssText = `background:white;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);overflow:hidden;min-width:160px;max-width:220px;border:1.5px solid ${style.color};`;

    const header = document.createElement("div");
    header.style.cssText = `padding:8px 12px;background:${style.color};color:white;font-size:12px;font-weight:600;`;
    header.textContent = `${style.icon} ${cluster.items.length}개 장소`;
    el.appendChild(header);

    // 리스트 영역: 4개까지만 보이고 나머지 스크롤
    const listWrap = document.createElement("div");
    listWrap.style.cssText = "max-height:168px;overflow-y:auto;";

    cluster.items.forEach((item) => {
      const place = { ...item.place };
      const idx = item.globalIdx;
      const row = document.createElement("div");
      row.style.cssText = "padding:10px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid #f4f4f5;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
      row.textContent = place.place_name;
      row.addEventListener("mouseenter", () => { row.style.background = "#f4f4f5"; });
      row.addEventListener("mouseleave", () => { row.style.background = "white"; });
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        lastActionRef.current = Date.now();
        selectPlace(place, idx);
      });
      listWrap.appendChild(row);
    });

    el.appendChild(listWrap);
    el.addEventListener("click", (e) => e.stopPropagation());

    const overlay = new kakao.maps.CustomOverlay({
      map,
      position,
      content: el,
      yAnchor: 1.15,
      xAnchor: 0.5,
      zIndex: 200,
    });
    popupOverlayRef.current = overlay;

    // 팝업이 잘리지 않도록 센터 잡고 위로 올림 (픽셀 단위)
    map.setCenter(position);
    map.panBy(0, -80);
  }

  function renderClusters(map: any, data: any[], category: CategoryCode) {
    const { kakao } = window;
    const style = getCategoryStyle(category);
    const clusters = buildClusters(data);

    clusters.forEach((cluster) => {
      const position = new kakao.maps.LatLng(cluster.lat, cluster.lng);

      if (cluster.items.length === 1) {
        // 단일 장소: 아이콘 버블
        const el = document.createElement("div");
        el.style.cssText = "cursor:pointer;";
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:4px;padding:4px 8px;background:white;border-radius:20px;box-shadow:0 1px 4px rgba(0,0,0,0.12);border:1.5px solid ${style.color};white-space:nowrap;">
            <span style="font-size:13px;line-height:1;">${style.icon}</span>
          </div>
        `;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          lastActionRef.current = Date.now();
          selectPlace(cluster.items[0].place, cluster.items[0].globalIdx);
        });

        const overlay = new kakao.maps.CustomOverlay({
          map, position, content: el,
          yAnchor: 0.5, xAnchor: 0.5, zIndex: 1,
        });
        clusterOverlaysRef.current.push(overlay);
      } else {
        // 클러스터: 갯수 표시
        const el = document.createElement("div");
        el.style.cssText = "cursor:pointer;";
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:4px;padding:5px 10px;background:${style.color};border-radius:20px;box-shadow:0 2px 8px ${style.color}44;white-space:nowrap;">
            <span style="font-size:13px;line-height:1;">${style.icon}</span>
            <span style="font-size:12px;font-weight:700;color:white;">${cluster.items.length}</span>
          </div>
        `;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          lastActionRef.current = Date.now();
          showClusterPopup(cluster);
        });

        const overlay = new kakao.maps.CustomOverlay({
          map, position, content: el,
          yAnchor: 0.5, xAnchor: 0.5, zIndex: 2,
        });
        clusterOverlaysRef.current.push(overlay);
      }
    });
  }

  function searchPlaces(map: any, center: any, category: CategoryCode) {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();

    clearAll();
    setPlaces([]);
    setSelectedIdx(null);

    ps.categorySearch(
      category,
      (data: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK) return;

        setPlaces(data);
        const bounds = new kakao.maps.LatLngBounds();
        data.forEach((place: any) => {
          bounds.extend(new kakao.maps.LatLng(place.y, place.x));
        });
        if (userPosRef.current) bounds.extend(userPosRef.current);
        map.setBounds(bounds);

        renderClusters(map, data, category);
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
    selectPlace(places[idx], idx);
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
