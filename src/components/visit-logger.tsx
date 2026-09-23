"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/use-auth-store";

declare global {
  interface Window {
    kakao: any;
  }
}

export function VisitLogger() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    supabase.from("visit_logs").insert({ user_id: user.id }).then();

    // 현재 위치의 동 정보를 profiles에 저장
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      const updateLocation = () => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(longitude, latitude, (result: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK || !result[0]) return;
          const region = result.find((r: any) => r.region_type === "H") || result[0];
          const dong = region.region_3depth_name || region.region_2depth_name || "";
          if (dong) {
            supabase.auth.updateUser({ data: { location: dong } }).then();
          }
        });
      };

      if (window.kakao?.maps?.services) {
        updateLocation();
      } else if (window.kakao?.maps) {
        window.kakao.maps.load(updateLocation);
      }
    });
  }, [user]);

  return null;
}
