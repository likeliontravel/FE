'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MapModal.module.scss';

interface MapModalProps {
  onClose: () => void;
  onSelectPlace: (place: { name: string; address: string; lat: number; lng: number }) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const MapModal = ({ onClose, onSelectPlace }: MapModalProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=705ecc4de821b5770092b4aeff178932&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => setIsLoaded(true));
      };
      document.head.appendChild(script);
    };
    loadKakaoMap();
  }, []);

  useEffect(() => {
    if (isLoaded && mapContainer.current && !map) {
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      const newMap = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(newMap);
      
      setTimeout(() => {
        newMap.relayout();
        newMap.setCenter(options.center);
      }, 200);
    }
  }, [isLoaded, map]);

  const searchPlaces = () => {
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
      alert('키워드를 입력해주세요!');
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data);
        const bounds = new window.kakao.maps.LatLngBounds();
        for (let i = 0; i < data.length; i++) {
          bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
        }
        map.setBounds(bounds);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        width: '800px', height: '600px', backgroundColor: 'white', borderRadius: '8px', padding: '20px',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3>장소 첨부하기</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', background:'none', border:'none', fontSize:'1.2rem' }}>X</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
            placeholder="장소 검색 (예: 강남역 맛집)"
            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button onClick={searchPlaces} style={{ padding: '8px 16px', backgroundColor: '#27abf1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>검색</button>
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '10px', overflow: 'hidden' }}>
          {/* 검색 목록 */}
          <div style={{ width: '30%', overflowY: 'auto', borderRight: '1px solid #eee' }}>
            {places.map((place, i) => (
              <div key={i} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                   onClick={() => {
                     const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
                     map.panTo(moveLatLon);
                   }}>
                <div style={{ fontWeight: 'bold' }}>{place.place_name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{place.address_name}</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlace({ name: place.place_name, address: place.address_name, lat: place.y, lng: place.x });
                    onClose();
                  }}
                  style={{ marginTop: '5px', padding: '4px 8px', fontSize: '12px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  첨부하기
                </button>
              </div>
            ))}
          </div>
          
          {/* 지도 영역 */}
          <div ref={mapContainer} style={{ flex: 1, backgroundColor: '#f0f0f0' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;