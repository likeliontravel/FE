'use client';
import { useState } from 'react';

const OPTIONS = [
  '가평/양평',
  '강릉',
  '경주',
  '강남',
  '부산',
  '여수',
  '인천',
  '중구/강북',
  '전주',
  '제주',
  '춘천/홍천',
  '태안',
  '통영/거제',
  '포항/안동',
];

export default function RegionSelector() {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option: any) => {
    setSelected(option === selected ? null : option);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '20px',
        marginLeft: '120px',
      }}
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          style={{
            width: '150px',
            height: '70px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: selected === option ? '#27abf1' : '#fff',
            color: selected === option ? 'white' : '#9fa2a6',
            cursor: 'pointer',
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
