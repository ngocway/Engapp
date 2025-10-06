import React, { useState, useRef } from 'react';
import { VocabFlashcard } from './VocabFlashcard';
import { PassageVocab } from '../types';

interface HighlightedTextProps {
  text: string;
  onVocabularyClick?: (word: string) => void;
  passageVocab?: PassageVocab[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, onVocabularyClick, passageVocab = [] }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [flashcardPosition, setFlashcardPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [isHoveringFlashcard, setIsHoveringFlashcard] = useState(false);
  const [isClickedFlashcard, setIsClickedFlashcard] = useState(false);
  const wordRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm để tách và highlight các từ trong dấu ngoặc vuông
  const renderHighlightedText = () => {
    // Regex để tìm các từ trong dấu ngoặc vuông [word] hoặc [word:meaning]
    const bracketRegex = /\[([^\]]+)\]/g;
    const parts = text.split(bracketRegex);
    
    return parts.map((part, index) => {
      // Nếu index lẻ, đây là từ trong ngoặc vuông
      if (index % 2 === 1) {
        const isHovered = hoveredWord === part;
        return (
          <span
            key={index}
            ref={(el) => { wordRefs.current[part] = el; }}
            className={`highlighted-vocab ${isHovered ? 'highlighted-vocab-hover' : ''}`}
            onMouseEnter={(e) => {
              // Clear any pending hide timeout
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              
              setHoveredWord(part);
              setIsClickedFlashcard(false); // Reset click state khi hover từ vựng mới
              // Tính toán vị trí cho flashcard
              const rect = e.currentTarget.getBoundingClientRect();
              setFlashcardPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10
              });
              setShowFlashcard(true);
            }}
            onMouseLeave={() => {
              // Delay để tránh flashcard biến mất khi di chuột từ text sang flashcard
              // Nhưng chỉ ẩn nếu không phải click flashcard và không đang hover flashcard
              hideTimeoutRef.current = setTimeout(() => {
                if (!isHoveringFlashcard && !isClickedFlashcard) {
                  setHoveredWord(null);
                  setShowFlashcard(false);
                  setFlashcardPosition(undefined);
                }
              }, 300);
            }}
            onClick={(e) => {
              onVocabularyClick?.(part);
              // Hiện flashcard khi click (luôn luôn)
              const rect = e.currentTarget.getBoundingClientRect();
              setFlashcardPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10
              });
              setShowFlashcard(true);
              setHoveredWord(part);
              setIsClickedFlashcard(true); // Đánh dấu đã click
              
              // Clear any pending hide timeout when clicking
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
            }}
            title={`Click hoặc hover để xem thông tin từ vựng: ${part}`}
          >
            {part}
          </span>
        );
      }
      // Nếu index chẵn, đây là text thường
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      <div className="highlighted-text-container">
        {renderHighlightedText()}
      </div>
      
      {/* Flashcard hiển thị khi hover */}
      {showFlashcard && hoveredWord && (
        <div
          onMouseEnter={() => {
            setIsHoveringFlashcard(true);
            // Clear any pending hide timeout when hovering flashcard
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setIsHoveringFlashcard(false);
            // Delay để tránh flashcard biến mất ngay lập tức
            // Nhưng chỉ ẩn nếu không phải click flashcard
            hideTimeoutRef.current = setTimeout(() => {
              if (!isClickedFlashcard) {
                setShowFlashcard(false);
                setFlashcardPosition(undefined);
                setHoveredWord(null);
              }
            }, 300);
          }}
        >
          <VocabFlashcard
            term={hoveredWord}
            passageVocab={passageVocab}
            onClose={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              setShowFlashcard(false);
              setFlashcardPosition(undefined);
              setHoveredWord(null);
              setIsHoveringFlashcard(false);
              setIsClickedFlashcard(false); // Reset click state
            }}
            position={flashcardPosition}
          />
        </div>
      )}
    </>
  );
};

export default HighlightedText;
