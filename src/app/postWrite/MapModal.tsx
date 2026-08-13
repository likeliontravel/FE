'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '705ecc4de821b5770092b4aeff178932';

  // 카카오 지도 스크립트 안전 로딩 및 타임아웃 처리
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    // 카카오 스크립트가 없으면 헤더에 주입
    if (!document.getElementById('kakao-map-script')) {
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
    }

    // 0.1초마다 kakao 객체 완성 상태 폴링 감지
    checkInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
          clearInterval(checkInterval);
          clearTimeout(timeoutTimer);
        });
      }
    }, 100);

    // 3.5초 동안 응답이 없으면 401 차단으로 판단하여 에러 출력
    timeoutTimer = setTimeout(() => {
      clearInterval(checkInterval);
      if (!isLoaded) {
        setLoadError('카카오 지도 로딩 실패!\n(카카오 개발자 센터 도메인 등록 상태를 확인해주세요.)');
      }
    }, 3500);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutTimer);
    };
  }, [KAKAO_APP_KEY, isLoaded]);

  // 지도 인스턴스 생성
  useEffect(() => {
    if (isLoaded && mapContainer.current && !map) {
      try {
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
      } catch (e) {
        console.error('지도 생성 중 에러:', e);
        setLoadError('지도 인스턴스 생성에 실패했습니다.');
      }
    }
  }, [isLoaded, map]);

  // 장소 검색
  const searchPlaces = () => {
    if (!keyword.trim()) {
      alert('검색어를 입력해주세요!');
      return;
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert('지도 서비스가 아직 준비되지 않았습니다.');
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
        if (map) map.setBounds(bounds);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else {
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
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>장소 첨부하기</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', background:'none', border:'none', fontSize:'1.2rem', fontWeight: 'bold' }}>X</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
            placeholder="장소 검색 (예: 강남역 맛집)"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button onClick={searchPlaces} style={{ padding: '8px 16px', backgroundColor: '#27abf1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>검색</button>
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '10px', overflow: 'hidden', minHeight: '450px' }}>
          {/* 검색 목록 */}
          <div style={{ width: '35%', overflowY: 'auto', borderRight: '1px solid #eee', paddingRight: '10px' }}>
            {loadError ? (
              <div style={{ textAlign: 'center', color: '#e53e3e', marginTop: '50px', fontSize: '13px', padding: '10px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                ⚠️ {loadError}
              </div>
            ) : !isLoaded ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontSize: '14px' }}>
                지도를 불러오는 중입니다...
              </div>
            ) : places.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontSize: '14px' }}>
                장소를 검색해보세요.
              </div>
            ) : (
              places.map((place, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                     onClick={() => {
                       if (map) {
                         const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
                         map.panTo(moveLatLon);
                       }
                     }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{place.place_name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{place.address_name || place.road_address_name}</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlace({ 
                        name: place.place_name, 
                        address: place.address_name || place.road_address_name || '주소 정보 없음', 
                        lat: parseFloat(place.y), 
                        lng: parseFloat(place.x) 
                      });
                      onClose();
                    }}
                    style={{ marginTop: '6px', padding: '4px 10px', fontSize: '12px', backgroundColor: '#27abf1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    첨부하기
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* 지도 영역 */}
          <div ref={mapContainer} style={{ flex: 1, height: '100%', minHeight: '400px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;