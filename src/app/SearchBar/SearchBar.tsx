import React, { useCallback } from 'react';
import Image from 'next/image';
import styles from '../../../styles/SearchBar/searchBar.module.scss';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
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
          width={20}
          height={20}
          className={styles.searchIcon}
        />
      </div>
    </div>
  );
};

export default SearchBar;
