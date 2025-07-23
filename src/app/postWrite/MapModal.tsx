'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../../styles/postWrite/mapModal.module.scss';
import PostWriteMap from './PostWriteMap'; // 경로를 실제 파일 위치에 맞게 수정해주세요.

interface Place {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapModalProps {
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose, onSelectPlace }) => {
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // 모달이 열릴 때 지도 컴포넌트를 렌더링하도록 상태를 변경
    setShowMap(true);
    // 모달이 닫힐 때(unmount) 지도 컴포넌트를 DOM에서 제거
    return () => setShowMap(false);
  }, []);

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    setSearchKeyword(keyword);
  };
  
  const handlePlaceClickInList = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleSelectAndClose = () => {
    if (selectedPlace) {
      onSelectPlace(selectedPlace);
      onClose();
    } else {
      alert('목록에서 장소를 먼저 선택해주세요.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>장소 찾기</h2>
          <div className={styles.buttonGroup}>
            <button className={styles.uploadButton} onClick={handleSelectAndClose}>올리기</button>
            <button className={styles.closeButton} onClick={onClose}>X</button>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.searchListSection}>
            <div className={styles.searchInputWrapper}>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="장소를 검색하세요" />
              <button onClick={handleSearch}>🔍</button>
            </div>
            <ul className={styles.placeList}>
              {places.length > 0 ? (
                places.map((place, index) => (
                  <li key={index} onClick={() => handlePlaceClickInList(place)} className={selectedPlace?.address === place.address ? styles.selected : ''}>
                    <strong>{place.name}</strong>
                    <span>{place.address}</span>
                  </li>
                ))
              ) : (
                <li className={styles.noResult}>장소를 검색해주세요.</li>
              )}
            </ul>
          </div>
          <div className={styles.mapSection}>
            {showMap && (
              <PostWriteMap
                searchKeyword={searchKeyword}
                onSelectPlace={setSelectedPlace}
                setPlaceList={setPlaces}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;