import React from 'react';

export type DifficultyFilter = 'all' | 'easy' | 'normal' | 'hard';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  difficultyFilter: DifficultyFilter;
  onDifficultyFilterChange: (filter: DifficultyFilter) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyFilterChange,
}) => {
  const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'easy', label: 'Easy' },
    { value: 'normal', label: 'Normal' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className="search-and-filter">
      <div className="search-container">
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Tìm kiếm bài học hoặc từ vựng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="filter-container">
        {difficultyOptions.map((option) => (
          <button
            key={option.value}
            className={`filter-btn ${difficultyFilter === option.value ? 'active' : ''}`}
            onClick={() => onDifficultyFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;
