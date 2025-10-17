import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Question, EnglishLevel } from '../types';
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

  const getEnglishLevelColor = (englishLevel?: EnglishLevel, level?: number) => {
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return '#ff6b9d'; // Pink for kids 2-4
        case 'kids-5-10': return '#4ecdc4'; // Teal for kids 5-10
        case 'basic': return '#10b981'; // Green for basic
        case 'independent': return '#3b82f6'; // Blue for independent
        case 'proficient': return '#ef4444'; // Red for proficient
        default: return '#64748b'; // Gray
      }
    }
    // Fallback to old level system
    switch (level) {
      case 1: return '#10b981'; // Green for A1
      case 2: return '#3b82f6'; // Blue for A2
      case 3: return '#f59e0b'; // Orange for B1
      case 4: return '#ef4444'; // Red for B2
      default: return '#64748b'; // Gray
    }
  };

  const getEnglishLevelText = (englishLevel?: EnglishLevel, level?: number) => {
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return '👶 Kids 2-4';
        case 'kids-5-10': return '🧒 Kids 5-10';
        case 'basic': return '🌱 Basic';
        case 'independent': return '🌿 Independent';
        case 'proficient': return '🌳 Proficient';
        default: return 'Basic';
      }
    }
    // Fallback to old level system
    switch (level) {
      case 1: return 'A1';
      case 2: return 'A2';
      case 3: return 'B1';
      case 4: return 'B2';
      default: return 'N/A';
    }
  };

  // Hàm xử lý khi click vào từ vựng được highlight
  const handleVocabularyClick = (word: string, event?: React.MouseEvent) => {
    console.log('🎯 handleVocabularyClick called with:', { word, hasEvent: !!event });
    
    // Tìm từ vựng trong passage vocab để hiển thị thông tin chi tiết
    const vocabItem = passage.vocab?.find(v => v.term === word);
    
    // Ưu tiên phát audio thực tế từ Firebase Storage
    if (vocabItem?.audio && (vocabItem.audio.startsWith('data:audio/') || vocabItem.audio.startsWith('http'))) {
      try {
        const audio = new Audio(vocabItem.audio);
        audio.play().catch((playError) => {
          console.error('Lỗi khi phát audio:', playError);
          // Fallback về text-to-speech nếu audio không phát được
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            speechSynthesis.speak(utterance);
          }
        });
      } catch (error) {
        console.error('Lỗi khi tạo audio object:', error);
        // Fallback về text-to-speech
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
    } else {
      // Fallback về text-to-speech nếu không có audio
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    }

    // Hiển thị flashcard gần từ vựng được click
    if (event) {
      console.log('🎯 Setting flashcard state...');
      setSelectedVocabTerm(word);
      
      // Tính toán vị trí thông minh cho flashcard
      const rect = event.currentTarget.getBoundingClientRect();
      const position = calculateSmartPosition(rect);
      
      setFlashcardPosition(position);
      setShowVocabFlashcard(true);
      console.log('🎯 Flashcard state set:', { word, position, showFlashcard: true });
    }
  };

  // Hàm tính toán vị trí thông minh cho flashcard để không che từ vựng
  const calculateSmartPosition = (rect: DOMRect) => {
    const flashcardWidth = 850;
    const flashcardHeight = 600; // Tăng chiều cao để chứa full nội dung
    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Tính toán vị trí ngang - ưu tiên đặt flashcard gần từ vựng
    let x = rect.right + 10; // Đặt bên phải từ vựng với khoảng cách 10px
    
    // Kiểm tra xem có đủ không gian bên phải không
    if (x + flashcardWidth > viewportWidth - padding) {
      // Không đủ không gian bên phải, thử đặt bên trái
      x = rect.left - flashcardWidth - 10;
      
      // Nếu vẫn không đủ không gian bên trái, đặt ở vị trí gần nhất có thể
      if (x < padding) {
        // Đặt flashcard ở vị trí gần từ vựng nhất có thể
        if (rect.left < viewportWidth / 2) {
          // Từ vựng ở bên trái, đặt flashcard sát bên phải màn hình
          x = viewportWidth - flashcardWidth - padding;
        } else {
          // Từ vựng ở bên phải, đặt flashcard sát bên trái màn hình
          x = padding;
        }
      }
    }
    
    // Tính toán vị trí dọc - ưu tiên đặt flashcard gần từ vựng
    let y = rect.bottom + 10; // Mặc định đặt phía dưới từ vựng với khoảng cách 10px
    
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
      // Không đủ không gian ở cả hai phía, đặt ở vị trí gần nhất có thể
      if (spaceBelow > spaceAbove) {
        // Phía dưới có nhiều không gian hơn, đặt flashcard ở phía dưới
        y = Math.min(viewportHeight - flashcardHeight - padding, rect.bottom + 10);
      } else {
        // Phía trên có nhiều không gian hơn, đặt flashcard ở phía trên
        y = Math.max(padding, rect.top - flashcardHeight - 10);
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


  // Debug log để theo dõi state
  useEffect(() => {
    console.log('🎯 Render check:', { showVocabFlashcard, selectedVocabTerm, flashcardPosition });
  }, [showVocabFlashcard, selectedVocabTerm, flashcardPosition]);

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

  // Audio player functionality - chỉ khởi tạo khi có audio
  useEffect(() => {
    // Chỉ khởi tạo audio player nếu có audio
    if (!passage.audioUrl) return;

    const audio = document.getElementById('lesson-audio') as HTMLAudioElement;
    const playBtn = document.getElementById('play-pause') as HTMLButtonElement;
    const progress = document.getElementById('progress') as HTMLDivElement;
    const current = document.getElementById('current-time') as HTMLSpanElement;
    const duration = document.getElementById('duration') as HTMLSpanElement;
    const speedBtn = document.getElementById('speed-btn') as HTMLButtonElement;

    if (!audio || !playBtn || !progress || !current || !duration || !speedBtn) return;

    let isPlaying = false;
    let speed = 1;

    const formatTime = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return '0:00';
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${secs}`;
    };

    const updateProgress = () => {
      const { currentTime, duration: dur } = audio;
      progress.style.width = `${(currentTime / dur) * 100}%`;
      current.textContent = formatTime(currentTime);
      duration.textContent = formatTime(dur);
    };

    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      } else {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }
      isPlaying = !isPlaying;
    });

    audio.addEventListener('timeupdate', updateProgress);

    speedBtn.addEventListener('click', () => {
      speed += 0.25;
      if (speed > 1.5) speed = 0.75;
      audio.playbackRate = speed;
      speedBtn.textContent = `${speed.toFixed(2)}x`.replace('.00', '');
    });

    // Cleanup function
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [passage.audioUrl]);

  // Mock words for dictation exercise
  const words = passage.text.split(' ').slice(0, 10);
  const maskedWords = words.map(word => '*'.repeat(word.length));

  return (
    <main className="lesson-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="#" onClick={() => navigate('/topics')}>{topicName || 'Chủ đề'}</a> › <span>{passage.title}</span>
      </nav>

      <div className="lesson-layout">
        {/* LEFT PANEL */}
        <aside className="lesson-info">
          <h2 className="lesson-title">{passage.title}</h2>

          <div className="lesson-thumb">
            {passage.thumbnail ? (
              <img src={passage.thumbnail} alt="Lesson Thumbnail" />
            ) : (
              <img src="https://i.ibb.co/nrRJLwH/dogs.jpg" alt="Lesson Thumbnail" />
            )}
          </div>

          <div className="vocab-section">
            <h3>Từ mới</h3>
            <div className="vocab-list">
              {(() => {
                // Use passage.vocab if available, otherwise fallback to extracting from text
                if (passage.vocab && passage.vocab.length > 0) {
                  return passage.vocab.map((vocab, index) => (
                    <button 
                      key={index} 
                      className="vocab-btn clickable-vocab"
                      onClick={(e) => handleNewWordClick(vocab.term, e)}
                    >
                      {vocab.term}
                    </button>
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
                      <button 
                        key={index} 
                        className="vocab-btn clickable-vocab"
                        onClick={(e) => handleNewWordClick(word, e)}
                      >
                        {word}
                      </button>
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
        </aside>

        {/* RIGHT PANEL */}
        <section className="lesson-content">
          <div className="tab-header">
            <button 
              className={`tab-btn ${activeTab === 'dictation' ? 'active' : ''}`} 
              data-tab="reading"
              onClick={() => setActiveTab('dictation')}
            >
              Đọc bài
            </button>
            <button 
              className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`} 
              data-tab="questions"
              onClick={() => setActiveTab('transcript')}
            >
              Câu hỏi
            </button>
          </div>

          {/* Tab: Reading */}
          <div className={`tab-body ${activeTab === 'dictation' ? 'active' : ''}`} id="reading">
            <h3>Nội dung bài học</h3>

            {/* Chỉ hiển thị audio player nếu có audio */}
            {passage.audioUrl && (
              <>
                <div className="audio-player">
                  <button id="play-pause" className="play-btn">
                    <i className="fa-solid fa-play"></i>
                  </button>
                  <div className="progress-wrapper">
                    <div className="progress-bar"><div id="progress"></div></div>
                    <div className="time">
                      <span id="current-time">0:00</span>
                      <span id="duration">0:00</span>
                    </div>
                  </div>
                  <button id="speed-btn" className="speed-btn">1x</button>
                </div>

                <audio id="lesson-audio" src={passage.audioUrl}></audio>
              </>
            )}

            <div className="lesson-text">
              <HighlightedText 
                text={passage.text}
                onVocabularyClick={handleVocabularyClick}
                passageVocab={passage.vocab || []}
              />
            </div>
          </div>

          {/* Tab: Questions */}
          <div className={`tab-body ${activeTab === 'transcript' ? 'active' : ''}`} id="questions">
            <h3>Câu hỏi ôn tập</h3>
            {loadingQuestions ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>
                  🔄 Đang tải câu hỏi...
                </p>
              </div>
            ) : (
              <QuizSection questions={questions} passageId={passage.id} />
            )}
          </div>
        </section>
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
    </main>
  );
};

export default PassageDetail;