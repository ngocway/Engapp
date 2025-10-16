import React from 'react';
import { Passage, EnglishLevel } from '../types';

interface LessonCardProps {
  passage: Passage;
  isLearned?: boolean;
  onClick: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ passage, isLearned = false, onClick }) => {
  const getEnglishLevelText = (englishLevels?: EnglishLevel[], englishLevel?: EnglishLevel, level?: number) => {
    if (englishLevels && englishLevels.length > 0) {
      // Show multiple levels
      if (englishLevels.length === 1) {
        switch (englishLevels[0]) {
          case 'kids-2-4': return 'Kids 2-4';
          case 'kids-5-10': return 'Kids 5-10';
          case 'basic': return 'Basic';
          case 'independent': return 'Independent';
          case 'proficient': return 'Proficient';
          default: return 'Basic';
        }
      } else {
        return `${englishLevels.length} LEVELS`;
      }
    }
    
    // Fallback to single level
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return 'Kids 2-4';
        case 'kids-5-10': return 'Kids 5-10';
        case 'basic': return 'Basic';
        case 'independent': return 'Independent';
        case 'proficient': return 'Proficient';
        default: return 'Basic';
      }
    }
    
    // Fallback to old level system
    switch (level) {
      case 1: return 'A1';
      case 2: return 'A2';
      case 3: return 'B1';
      case 4: return 'B2';
      default: return 'A1';
    }
  };

  const getStatusText = () => {
    return isLearned ? 'Đã học' : 'Chưa học';
  };

  const getStatusClass = () => {
    return isLearned ? 'done' : 'new';
  };

  const getWordCount = () => {
    return passage.vocab?.length || 0;
  };

  return (
    <div 
      className={`lesson-card ${isLearned ? 'learned' : ''}`}
      onClick={onClick}
    >
      <div className="lesson-thumb">
        {passage.thumbnail ? (
          <img src={passage.thumbnail} alt={passage.title} />
        ) : (
          <div className="thumbnail-placeholder">
            📚
          </div>
        )}
        <span className="level">
          {getEnglishLevelText(passage.englishLevels, passage.englishLevel, passage.level)}
        </span>
        <span className={`status ${getStatusClass()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="lesson-content">
        <h3 className="lesson-title">{passage.title}</h3>
        <p className="lesson-desc">
          {passage.excerpt || 'Khám phá từ vựng mới và luyện tập kỹ năng đọc hiểu thông qua bài học thú vị này.'}
        </p>

        <div className="lesson-footer">
          <span className="word-count">🔤 {getWordCount()} từ mới</span>
          <button className="btn-learn">Học ngay</button>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
