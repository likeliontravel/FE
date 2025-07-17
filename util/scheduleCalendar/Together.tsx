'use client';
import { useState } from 'react';

const OPTIONS = [
  '혼자 여행',
  '친구와 함께',
  '연인과 함께',
  '아이와 함께',
  '부모님과 함께',
];

export default function Together() {
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
