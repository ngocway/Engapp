import React from 'react';
import { Vocabulary } from '../types';

interface VocabCardProps {
  vocab: Vocabulary;
  difficulty?: 'easy' | 'normal' | 'hard' | null;
  onClick: (event: React.MouseEvent) => void;
}

const VocabCard: React.FC<VocabCardProps> = ({ vocab, difficulty, onClick }) => {
  const getDifficultyInfo = () => {
    if (!difficulty) return null;
    
    switch (difficulty) {
      case 'easy':
        return { level: 'Easy', color: '#22c55e', icon: '🟢' };
      case 'normal':
        return { level: 'Normal', color: '#f59e0b', icon: '🟡' };
      case 'hard':
        return { level: 'Hard', color: '#ef4444', icon: '🔴' };
      default:
        return null;
    }
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div 
      className="lesson-card learned"
      onClick={onClick}
    >
      <div className="lesson-thumb">
        {vocab.image ? (
          <img src={vocab.image} alt={vocab.word} />
        ) : (
          <div className="thumbnail-placeholder">
            🎓
          </div>
        )}
        <span className="level">
          {vocab.partOfSpeech || 'Word'}
        </span>
        {difficultyInfo && (
          <span 
            className="status done"
            style={{ backgroundColor: difficultyInfo.color }}
          >
            {difficultyInfo.icon} {difficultyInfo.level}
          </span>
        )}
      </div>

      <div className="lesson-content">
        <h3 className="lesson-title">{vocab.word}</h3>
        <p className="lesson-desc">
          {vocab.meaning || vocab.definitionEn || 'Khám phá nghĩa và cách sử dụng từ vựng này.'}
        </p>

        <div className="lesson-footer">
          <span className="word-count">🔤 Đã học</span>
          <button className="btn-learn">Ôn lại</button>
        </div>
      </div>
    </div>
  );
};

export default VocabCard;
