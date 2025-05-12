'use client';
import { useState } from 'react';

const OPTIONS = [
  '체험/액티비티',
  '자연 속에서 힐링',
  '열정적인 쇼핑 투어',
  '미식 여행/먹방 중심',
  '문화/예술 & 역사 탐방',
];

export default function ThemeSelector() {
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
