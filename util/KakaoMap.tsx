"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) return;

    const onLoadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.warn("Kakao 객체가 아직 준비되지 않았습니다.");
        return;
      }

      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      };
      new window.kakao.maps.Map(container, options);
    };

    window.kakao.maps.load(onLoadKakaoMap);
  }, [scriptLoaded]);

  return (
    <>
      <Script
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=705ecc4de821b5770092b4aeff178932&autoload=false"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
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
