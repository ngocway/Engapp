import React, { useState } from 'react';
import './ReviewOptionsModal.css';

interface ReviewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlashcardClick: () => void;
  onQuizClick: () => void;
  vocabularyCount: number;
}

const ReviewOptionsModal: React.FC<ReviewOptionsModalProps> = ({
  isOpen,
  onClose,
  onFlashcardClick,
  onQuizClick,
  vocabularyCount
}) => {
  const [selectedOption, setSelectedOption] = useState<'flashcard' | 'quiz' | null>('flashcard');

  if (!isOpen) return null;

  const handleFlashcardClick = () => {
    setSelectedOption('flashcard');
  };

  const handleQuizClick = () => {
    setSelectedOption('quiz');
  };

  const handleStartClick = () => {
    if (selectedOption === 'flashcard') {
      onFlashcardClick();
    } else if (selectedOption === 'quiz') {
      onQuizClick();
    }
    onClose();
  };

  const handleCancelClick = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-options-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 Chọn phương thức ôn tập</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Bạn có <strong>{vocabularyCount} từ vựng</strong> để ôn tập.<br />
            Hãy chọn cách học phù hợp với bạn 🎯
          </p>
          
          <div className="options-container">
            <div 
              className={`option-card flashcard-option ${selectedOption === 'flashcard' ? 'selected' : ''}`}
              onClick={handleFlashcardClick}
            >
              <div className="option-icon">
                🧠
              </div>
              <div className="option-content">
                <h4>Ôn theo Flashcard</h4>
                <p>Học từ vựng bằng thẻ ghi nhớ tương tác.</p>
              </div>
              <div className="option-features">
                <span className="feature-tag">Hiệu quả</span>
              </div>
            </div>

            <div 
              className={`option-card quiz-option ${selectedOption === 'quiz' ? 'selected' : ''}`}
              onClick={handleQuizClick}
            >
              <div className="option-icon">
                ❓
              </div>
              <div className="option-content">
                <h4>Trả lời câu hỏi</h4>
                <p>Kiểm tra kiến thức bằng các câu hỏi trắc nghiệm.</p>
              </div>
              <div className="option-features">
                <span className="feature-tag">Đánh giá</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="cancel-btn" onClick={handleCancelClick}>
              Hủy
            </button>
            <button 
              className="start-btn" 
              onClick={handleStartClick}
              disabled={!selectedOption}
            >
              🚀 Bắt đầu ôn tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOptionsModal;
