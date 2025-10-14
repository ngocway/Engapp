import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Question } from '../types';
import { topicService } from '../firebase/topicService';
import { questionService } from '../firebase/questionService';
import HighlightedText from './HighlightedText';
import QuizSection from './QuizSection';
import { VocabFlashcard } from './VocabFlashcard';

interface PassageDetailProps {
  passage: Passage;
  onBack: () => void;
}

const PassageDetail: React.FC<PassageDetailProps> = ({ passage, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dictation' | 'transcript'>('dictation');
  const [userInput, setUserInput] = useState('');
  const [showAllWords, setShowAllWords] = useState(false);
  const [topicName, setTopicName] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // State for vocabulary flashcard
  const [showVocabFlashcard, setShowVocabFlashcard] = useState(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState<string>('');
  const [flashcardPosition, setFlashcardPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return '#10b981'; // Green for A1
      case 2: return '#3b82f6'; // Blue for A2
      case 3: return '#f59e0b'; // Orange for B1
      case 4: return '#ef4444'; // Red for B2
      default: return '#64748b'; // Gray
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'A1';
      case 2: return 'A2';
      case 3: return 'B1';
      case 4: return 'B2';
      default: return 'N/A';
    }
  };

  // Hàm xử lý khi click vào từ vựng được highlight
  const handleVocabularyClick = (word: string) => {
    // Phát âm từ vựng
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

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

  // Hàm xử lý khi click vào từ vựng trong phần "Từ mới"
  const handleNewWordClick = (term: string, event: React.MouseEvent) => {
    setSelectedVocabTerm(term);
    
    // Tính toán vị trí thông minh cho flashcard
    const rect = event.currentTarget.getBoundingClientRect();
    const position = calculateSmartPosition(rect);
    
    setFlashcardPosition(position);
    setShowVocabFlashcard(true);
  };

  // Hàm đóng flashcard
  const handleCloseFlashcard = () => {
    setShowVocabFlashcard(false);
    setSelectedVocabTerm('');
    setFlashcardPosition(undefined);
  };

  // Load questions when transcript tab is active
  useEffect(() => {
    if (activeTab === 'transcript') {
      const loadQuestions = async () => {
        try {
          setLoadingQuestions(true);
          const passageQuestions = await questionService.getByPassageId(passage.id);
          setQuestions(passageQuestions);
        } catch (error) {
          console.error('Error loading questions:', error);
        } finally {
          setLoadingQuestions(false);
        }
      };
      loadQuestions();
    }
  }, [activeTab, passage.id]);


  // Cập nhật vị trí flashcard khi window resize
  useEffect(() => {
    const handleResize = () => {
      if (showVocabFlashcard && selectedVocabTerm) {
        // Tìm lại element từ vựng đang được chọn và tính toán lại vị trí
        const vocabElements = document.querySelectorAll('.clickable-vocab');
        vocabElements.forEach((element) => {
          if (element.textContent?.trim() === selectedVocabTerm) {
            const rect = element.getBoundingClientRect();
            const position = calculateSmartPosition(rect);
            setFlashcardPosition(position);
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showVocabFlashcard, selectedVocabTerm]);

  // Load topic name
  useEffect(() => {
    const loadTopicName = async () => {
      console.log('Loading topic name for passage:', passage);
      console.log('Passage topicId:', passage.topicId);
      
      try {
        const topics = await topicService.getAll();
        console.log('All topics:', topics);
        
        let topic = null;
        
        // Try to find by topicId first
        if (passage.topicId) {
          topic = topics.find(t => t.id === passage.topicId);
          console.log('Found topic by ID:', topic);
        }
        
        // Fallback: try to find by slug if not found by ID
        if (!topic && passage.topicSlug) {
          topic = topics.find(t => t.slug === passage.topicSlug);
          console.log('Found topic by slug:', topic);
        }
        
        // If still no topic found, try to infer from passage title or use default
        if (!topic) {
          // Try to match by common patterns in passage titles
          const passageTitle = passage.title.toLowerCase();
          if (passageTitle.includes('nature') || passageTitle.includes('tree') || passageTitle.includes('star')) {
            topic = topics.find(t => t.slug === 'nature' || t.name?.toLowerCase().includes('nature'));
          } else if (passageTitle.includes('travel') || passageTitle.includes('river') || passageTitle.includes('park')) {
            topic = topics.find(t => t.slug === 'travel' || t.name?.toLowerCase().includes('travel'));
          } else if (passageTitle.includes('daily') || passageTitle.includes('activity')) {
            topic = topics.find(t => t.slug === 'daily-activities' || t.name?.toLowerCase().includes('daily'));
          }
          console.log('Found topic by inference:', topic);
        }
        
        if (topic && (topic.name || topic.title)) {
          const topicName = topic.name || topic.title;
          console.log('Setting topic name:', topicName);
          setTopicName(topicName);
        } else {
          console.log('Topic not found, using fallback');
          setTopicName('Chủ đề');
        }
      } catch (error) {
        console.error('Error loading topic:', error);
        setTopicName('Chủ đề');
      }
    };
    loadTopicName();
  }, [passage.topicId]);

  // Mock words for dictation exercise
  const words = passage.text.split(' ').slice(0, 10);
  const maskedWords = words.map(word => '*'.repeat(word.length));

  return (
    <div className="passage-detail-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate('/topics')}>{topicName || 'Chủ đề'}</span>
        <span>›</span>
        <span>{passage.title}</span>
      </div>

      <div className="passage-detail-layout">
        {/* Left Panel - Video */}
        <div className="left-panel">
          <h3 className="panel-title">{passage.title}</h3>
          
          <div className="video-container">
            <div className="video-player">
              {passage.thumbnail ? (
                <img src={passage.thumbnail} alt={passage.title} className="video-thumbnail" />
              ) : (
                <div className="video-placeholder">
                  <div className="play-button">▶</div>
                </div>
              )}
              <div className="video-overlay">
                <div className="video-title">{passage.title}</div>
                <div className="video-source">Xem trên YouTube</div>
              </div>
            </div>
          </div>

          <div className="vocabulary-section">
            <h4>Từ mới</h4>
            <div className="vocabulary-list">
              {(() => {
                // Use passage.vocab if available, otherwise fallback to extracting from text
                if (passage.vocab && passage.vocab.length > 0) {
                  return passage.vocab.map((vocab, index) => (
                    <div 
                      key={index} 
                      className="vocabulary-item clickable-vocab"
                      onClick={(e) => handleNewWordClick(vocab.term, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="vocab-word">{vocab.term}</div>
                    </div>
                  ));
                } else {
                  // Fallback: Extract vocabulary from text (same logic as HighlightedText)
                  const bracketRegex = /\[([^\]]+)\]/g;
                  const matches = passage.text.match(bracketRegex);
                  
                  if (matches && matches.length > 0) {
                    const vocabularyWords = matches.map(match => {
                      const word = match.slice(1, -1).trim(); // Remove brackets
                      return word;
                    }).filter(word => word.length > 0);
                    
                    // Remove duplicates
                    const uniqueWords = Array.from(new Set(vocabularyWords));
                    
                    return uniqueWords.map((word, index) => (
                      <div 
                        key={index} 
                        className="vocabulary-item clickable-vocab"
                        onClick={(e) => handleNewWordClick(word, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="vocab-word">{word}</div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="no-vocabulary">
                        <p>Không có từ vựng nào được định nghĩa trong bài học này.</p>
                        <p><small>💡 Để thêm từ vựng, sử dụng chức năng "Quản lý từ vựng" trong admin</small></p>
                      </div>
                    );
                  }
                }
              })()}
            </div>
          </div>
        </div>

        {/* Right Panel - Exercise */}
        <div className="right-panel">
          <div className="exercise-tabs">
            <div className="package-tab-wrapper">
              <input 
                type="radio" 
                id="tab-1" 
                name="tab" 
                className="input"
                checked={activeTab === 'dictation'}
                onChange={() => setActiveTab('dictation')}
              />
              <label htmlFor="tab-1" className="package-tab">
                Đọc bài
              </label>
              
              <input 
                type="radio" 
                id="tab-2" 
                name="tab" 
                className="input"
                checked={activeTab === 'transcript'}
                onChange={() => setActiveTab('transcript')}
              />
              <label htmlFor="tab-2" className="package-tab">
                Câu hỏi
              </label>
            </div>
          </div>

          {activeTab === 'dictation' ? (
            <div className="lesson-content">
              <h3>Nội dung bài học</h3>
              <div className="content-text">
                <HighlightedText 
                  text={passage.text} 
                  onVocabularyClick={handleVocabularyClick}
                  passageVocab={passage.vocab || []}
                />
              </div>
            </div>
          ) : (
            <>
              {loadingQuestions ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#666', fontSize: '1.2rem' }}>
                    🔄 Đang tải câu hỏi...
                  </p>
                </div>
              ) : (
                <QuizSection questions={questions} passageId={passage.id} />
              )}
            </>
          )}
        </div>
      </div>

      {/* VocabFlashcard hiển thị khi click vào từ vựng trong phần "Từ mới" */}
      {showVocabFlashcard && selectedVocabTerm && (
        <VocabFlashcard
          term={selectedVocabTerm}
          passageVocab={passage.vocab || []}
          onClose={handleCloseFlashcard}
          position={flashcardPosition}
        />
      )}
    </div>
  );
};

export default PassageDetail;