"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const { events } = useSelector((state: RootState) => state.schedule);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // 카카오맵 스크립트가 로드되었고, services 라이브러리까지 준비되었을 때만 실행
    if (
      !scriptLoaded ||
      !window.kakao ||
      !window.kakao.maps ||
      !window.kakao.maps.services
    )
      return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      // 기본 지도 생성 (초기 중심좌표는 서울)
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 💡 주소-좌표 변환 객체 생성
      const geocoder = new window.kakao.maps.services.Geocoder();
      // 💡 모든 핑(마커)이 한눈에 보이도록 지도 범위를 재설정할 객체
      const bounds = new window.kakao.maps.LatLngBounds();
      let hasValidMarkers = false;

      // events 배열을 돌면서 각각의 주소를 좌표로 변환하고 마커를 찍습니다.
      events.forEach((event) => {
        if (event.address) {
          geocoder.addressSearch(
            event.address,
            function (result: any, status: any) {
              // 정상적으로 검색이 완료됐으면
              if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(
                  result[0].y,
                  result[0].x,
                );

                // 📍 핑(마커) 생성
                const marker = new window.kakao.maps.Marker({
                  map: map,
                  position: coords,
                });

                // 💬 (선택사항) 핑 위에 장소 이름 말풍선 띄우기
                const infowindow = new window.kakao.maps.InfoWindow({
                  content: `<div style="padding:5px;font-size:12px;text-align:center;">${event.title}</div>`,
                });
                infowindow.open(map, marker);

                // 생성된 좌표를 bounds 객체에 추가
                bounds.extend(coords);
                hasValidMarkers = true;

                // 마커가 추가될 때마다 모든 마커가 보이도록 지도 범위 재설정
                map.setBounds(bounds);
              }
            },
          );
        }
      });
    });
  }, [scriptLoaded, events]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        id="map"
        style={{
          width: "80%",
          height: "440px",
          marginTop: "50px",
          marginBottom: "100px",
          borderRadius: "5px",
        }}
      ></div>
    </>
  );
}
