import React, { useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/SearchBar/searchBar.module.scss';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const recommendedKeywords = [
  '잠실 크리스마스✨',
  '제주🎄',
  '정동진 해수욕장 일출🌞',
];

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  const handleKeywordClick = useCallback(
    (keyword: string) => () => {
      setSearchTerm(keyword);
    },
    [setSearchTerm]
  );

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="여행지를 검색하세요..."
          className={styles.searchInput}
        />
        <Image
          src="/imgs/search.png"
          alt="검색 아이콘"
          width={24}
          height={24}
          className={styles.searchIcon}
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
