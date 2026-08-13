'use client';

import Script from 'next/script';
import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface PostWriteMapProps {
  searchKeyword: string;
  onSelectPlace: (place: { name: string; address: string; lat: number; lng: number }) => void;
  setPlaceList: (places: { name: string; address: string; lat: number; lng: number }[]) => void;
}

function MapLogic({ map, searchKeyword, onSelectPlace, setPlaceList }: any) {
  useEffect(() => {
    if (!map || !searchKeyword || !window.kakao?.maps?.services) return;

    const markers: any[] = [];
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      markers.forEach(marker => marker.setMap(null));
      markers.length = 0;

      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();
        const newPlaces = [];

        for (let i = 0; i < data.length; i++) {
          const place = data[i];
          const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
          const marker = new window.kakao.maps.Marker({ map, position: placePosition });
          markers.push(marker);

          window.kakao.maps.event.addListener(marker, 'click', function () {
            onSelectPlace({ 
              name: place.place_name, 
              address: place.address_name || place.road_address_name, 
              lat: parseFloat(place.y), 
              lng: parseFloat(place.x) 
            });
          });
          
          newPlaces.push({ 
            name: place.place_name, 
            address: place.address_name || place.road_address_name, 
            lat: parseFloat(place.y), 
            lng: parseFloat(place.x) 
          });
          bounds.extend(placePosition);
        }
        setPlaceList(newPlaces);
        map.setBounds(bounds);
      } else {
        setPlaceList([]);
      }
    });

    return () => { markers.forEach(marker => marker.setMap(null)); };
  }, [map, searchKeyword, onSelectPlace, setPlaceList]);

  return null;
}

export default function PostWriteMap({ searchKeyword, onSelectPlace, setPlaceList }: PostWriteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '705ecc4de821b5770092b4aeff178932';

  const initMap = () => {
    if (window.kakao && window.kakao.maps && mapContainerRef.current) {
      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;
        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };
        const mapInstance = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
        setMap(mapInstance);
      });
    }
  };

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    }
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <Script
        id="kakao-map-script"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <div ref={mapContainerRef} id="post-write-map" style={{ width: '100%', height: '100%', minHeight: '400px' }}></div>
      <MapLogic 
        map={map} 
        searchKeyword={searchKeyword} 
        onSelectPlace={onSelectPlace} 
        setPlaceList={setPlaceList}
      />
    </div>
  );
}