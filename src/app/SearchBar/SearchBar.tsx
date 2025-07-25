'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/SearchBar/searchBar.module.scss'; 

interface SearchBarProps {
  onSearch?: (term: string) => void; 
}

const recommendedKeywords = [
  '잠실 크리스마스✨',
  '제주🎄',
  '정동진 해수욕장 일출🌞',
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.target.value);
  }, []);

  const handleSearchAction = (term: string) => {
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleKeywordClick = (keyword: string) => () => {
    setInternalSearchTerm(keyword);
    handleSearchAction(keyword);
  };

  const handleSearchClick = () => {
    handleSearchAction(internalSearchTerm);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={internalSearchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="여행지를 검색하세요..."
          className={styles.searchInput}
        />
        <Image
          src="/imgs/search.png"
          alt="검색 아이콘"
          width={24}
          height={24}
          className={styles.searchIcon}
          onClick={handleSearchClick}
        />
      </div>

      <div className={styles.recommendedKeywords}>
        {recommendedKeywords.map((keyword) => (
          <span
            key={keyword}
            className={styles.keyword}
            onClick={handleKeywordClick(keyword)}
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;