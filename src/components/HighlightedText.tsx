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

  // Hàm tính toán vị trí thông minh cho flashcard để không che từ vựng
  const calculateSmartPosition = (rect: DOMRect) => {
    const flashcardWidth = 600;
    const flashcardHeight = 400; // Ước tính chiều cao flashcard
    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Tính toán vị trí ngang - ưu tiên đặt flashcard ở bên phải hoặc trái từ vựng
    let x = rect.right + 10; // Mặc định đặt bên phải từ vựng
    
    // Kiểm tra xem có đủ không gian bên phải không
    if (x + flashcardWidth > viewportWidth - padding) {
      // Không đủ không gian bên phải, thử đặt bên trái
      x = rect.left - flashcardWidth - 10;
      
      // Nếu vẫn không đủ không gian bên trái, đặt ở giữa nhưng tránh che từ vựng
      if (x < padding) {
        // Tính toán vị trí để không che từ vựng
        const wordCenterX = rect.left + rect.width / 2;
        const wordLeft = rect.left;
        const wordRight = rect.right;
        
        // Thử đặt flashcard ở phía trên hoặc dưới từ vựng
        if (wordCenterX - flashcardWidth / 2 >= padding && wordCenterX + flashcardWidth / 2 <= viewportWidth - padding) {
          // Có thể đặt ở giữa mà không che từ vựng
          x = wordCenterX - flashcardWidth / 2;
        } else {
          // Đặt sát bên trái hoặc phải màn hình
          if (wordLeft < viewportWidth - wordRight) {
            // Từ vựng gần bên trái, đặt flashcard sát bên phải
            x = viewportWidth - flashcardWidth - padding;
          } else {
            // Từ vựng gần bên phải, đặt flashcard sát bên trái
            x = padding;
          }
        }
      }
    }
    
    // Tính toán vị trí dọc - ưu tiên không che từ vựng
    let y = rect.bottom + 10; // Mặc định đặt phía dưới từ vựng
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Kiểm tra xem có đủ không gian phía dưới không
    if (spaceBelow >= flashcardHeight + padding) {
      // Có đủ không gian phía dưới, hiển thị phía dưới từ vựng
      y = rect.bottom + 10;
    } else if (spaceAbove >= flashcardHeight + padding) {
      // Có đủ không gian phía trên, hiển thị phía trên từ vựng
      y = rect.top - flashcardHeight - 10;
    } else {
      // Không đủ không gian ở cả hai phía
      // Tính toán vị trí để che ít nhất từ vựng
      const wordCenterY = rect.top + rect.height / 2;
      
      if (spaceBelow > spaceAbove) {
        // Phía dưới có nhiều không gian hơn, đặt flashcard ở phía dưới
        y = Math.min(viewportHeight - flashcardHeight - padding, rect.bottom + 10);
      } else {
        // Phía trên có nhiều không gian hơn, đặt flashcard ở phía trên
        y = Math.max(padding, rect.top - flashcardHeight - 10);
      }
      
      // Nếu vẫn che từ vựng, thử đặt ở vị trí khác
      if (y <= rect.bottom && y + flashcardHeight >= rect.top) {
        // Flashcard vẫn che từ vựng, đặt ở vị trí tối ưu
        if (wordCenterY < viewportHeight / 2) {
          // Từ vựng ở nửa trên màn hình, đặt flashcard ở phía dưới
          y = viewportHeight - flashcardHeight - padding;
        } else {
          // Từ vựng ở nửa dưới màn hình, đặt flashcard ở phía trên
          y = padding;
        }
      }
    }
    
    // Đảm bảo flashcard không vượt ra ngoài viewport
    x = Math.max(padding, Math.min(x, viewportWidth - flashcardWidth - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - flashcardHeight - padding));
    
    return { x, y };
  };

  // Hàm chuyển đổi HTML thành plain text nhưng vẫn giữ từ vựng trong brackets
  const convertHtmlToTextWithVocab = (htmlText: string): string => {
    // Tạo một div tạm để parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;
    
    // Lấy text content
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    return plainText;
  };

  // Hàm để tách và highlight các từ trong dấu ngoặc vuông
  const renderHighlightedText = () => {
    // Chuyển đổi HTML thành text với từ vựng trong brackets
    const processedText = convertHtmlToTextWithVocab(text);
    
    // Regex để tìm các từ trong dấu ngoặc vuông [word] - chỉ match từ đơn lẻ
    const bracketRegex = /\[([^\]]+?)\]/g;
    const parts = processedText.split(bracketRegex);
    
    return parts.map((part, index) => {
      // Nếu index lẻ, đây là từ trong ngoặc vuông
      if (index % 2 === 1) {
        // Chỉ highlight nếu là từ đơn lẻ (không có space)
        if (part.trim().includes(' ')) {
          // Nếu có nhiều từ trong brackets, tách ra và chỉ highlight từ đầu tiên
          const words = part.trim().split(/\s+/);
          const firstWord = words[0];
          const remainingText = words.slice(1).join(' ');
          
          return (
            <span key={index}>
              <span
                ref={(el) => { wordRefs.current[firstWord] = el; }}
                className={`highlighted-vocab ${hoveredWord === firstWord ? 'highlighted-vocab-hover' : ''}`}
                onMouseEnter={(e) => {
                  if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                  }
                  setHoveredWord(firstWord);
                  setIsClickedFlashcard(false);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = calculateSmartPosition(rect);
                  setFlashcardPosition(position);
                  setShowFlashcard(true);
                }}
                onMouseLeave={() => {
                  hideTimeoutRef.current = setTimeout(() => {
                    if (!isHoveringFlashcard && !isClickedFlashcard) {
                      setHoveredWord(null);
                      setShowFlashcard(false);
                      setFlashcardPosition(undefined);
                    }
                  }, 300);
                }}
                onClick={(e) => {
                  onVocabularyClick?.(firstWord);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = calculateSmartPosition(rect);
                  setFlashcardPosition(position);
                  setShowFlashcard(true);
                  setHoveredWord(firstWord);
                  setIsClickedFlashcard(true);
                  if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                  }
                }}
                title={`Click hoặc hover để xem thông tin từ vựng: ${firstWord}`}
              >
                {firstWord}
              </span>
              {remainingText && ` ${remainingText}`}
            </span>
          );
        } else {
          // Từ đơn lẻ - highlight bình thường
          const isHovered = hoveredWord === part;
          return (
            <span
              key={index}
              ref={(el) => { wordRefs.current[part] = el; }}
              className={`highlighted-vocab ${isHovered ? 'highlighted-vocab-hover' : ''}`}
              onMouseEnter={(e) => {
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                setHoveredWord(part);
                setIsClickedFlashcard(false);
                const rect = e.currentTarget.getBoundingClientRect();
                const position = calculateSmartPosition(rect);
                setFlashcardPosition(position);
                setShowFlashcard(true);
              }}
              onMouseLeave={() => {
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
                const rect = e.currentTarget.getBoundingClientRect();
                const position = calculateSmartPosition(rect);
                setFlashcardPosition(position);
                setShowFlashcard(true);
                setHoveredWord(part);
                setIsClickedFlashcard(true);
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
