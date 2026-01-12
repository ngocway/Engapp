import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Question, EnglishLevel, PassageVocab } from '../types';
import { topicService } from '../firebase/topicService';
import { questionService } from '../firebase/questionService';
import HighlightedText from '../components/HighlightedText';
import QuizSection from '../components/QuizSection';
import VocabPopup from '../components/VocabPopup';
import ImageUpdateButton from '../components/ImageUpdateButton';

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

  // State for vocabulary popup
  const [showVocabPopup, setShowVocabPopup] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<PassageVocab | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // State for related passages
  const [relatedPassages, setRelatedPassages] = useState<Passage[]>([]);

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

    if (vocabItem && event) {
      // Hiển thị popup gần từ vựng được click
      const rect = event.currentTarget.getBoundingClientRect();
      setAnchorRect(rect);
      setSelectedVocab(vocabItem);
      setShowVocabPopup(true);
      console.log('🎯 VocabPopup state set:', { vocabItem, rect });
    }
  };


  // Hàm xử lý khi click vào từ vựng trong phần "Từ mới"
  const handleNewWordClick = (term: string, event: React.MouseEvent) => {
    const vocabItem = passage.vocab?.find(v => v.term === term);

    if (vocabItem) {
      const rect = event.currentTarget.getBoundingClientRect();
      setAnchorRect(rect);
      setSelectedVocab(vocabItem);
      setShowVocabPopup(true);
    }
  };

  // Hàm đóng popup
  const handleClosePopup = () => {
    setShowVocabPopup(false);
    setSelectedVocab(null);
    setAnchorRect(null);
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
    console.log('🎯 Render check:', { showVocabPopup, selectedVocab, anchorRect });
  }, [showVocabPopup, selectedVocab, anchorRect]);

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

  // Load related passages from the same topic
  useEffect(() => {
    const loadRelatedPassages = async () => {
      if (passage.topicSlug) {
        try {
          const { passageService } = await import('../firebase/passageService');
          const allPassages = await passageService.getByTopicSlug(passage.topicSlug);
          // Filter out current passage and get up to 4 related ones
          const related = allPassages
            .filter(p => p.id !== passage.id)
            .slice(0, 4);
          setRelatedPassages(related);
        } catch (error) {
          console.error('Error loading related passages:', error);
        }
      }
    };
    loadRelatedPassages();
  }, [passage.id, passage.topicSlug]);

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
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/topics'); }} className="hover:text-primary transition-colors">
          {topicName || 'Chủ đề'}
        </a>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">{passage.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR - Image & Vocabulary */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h1 className="text-xl font-bold mb-4 text-slate-900 dark:text-white leading-tight">{passage.title}</h1>

            <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 relative shadow-md">
              <img
                alt={passage.title}
                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                src={passage.thumbnail || "https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.src = 'https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

              {/* Image Updater Trigger */}
              <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                <ImageUpdateButton />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Vocabulary</h2>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                  {passage.vocab?.length || 0} WORDS
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  if (passage.vocab && passage.vocab.length > 0) {
                    return passage.vocab.map((vocab, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary transition-all cursor-pointer"
                        onClick={(e) => handleNewWordClick(vocab.term, e)}
                      >
                        {vocab.term}
                      </span>
                    ));
                  } else {
                    // Fallback extraction
                    const bracketRegex = /\[([^\]]+)\]/g;
                    const matches = passage.text.match(bracketRegex);
                    if (matches && matches.length > 0) {
                      const uniqueWords = Array.from(new Set(matches.map(m => m.slice(1, -1).trim()).filter(w => w.length > 0)));
                      return uniqueWords.map((word, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all cursor-pointer"
                          onClick={(e) => handleNewWordClick(word, e)}
                        >
                          {word}
                        </span>
                      ));
                    }
                    return <p className="text-sm text-gray-400 italic">No vocabulary words marked.</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER CONTENT - Reading/Questions */}
        <div className="lg:col-span-6">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">

            {/* Tabs & Audio Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
              <div className="flex">
                <button
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'dictation' ? 'text-primary border-primary' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}
                  onClick={() => setActiveTab('dictation')}
                >
                  Reading
                </button>
                <button
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'transcript' ? 'text-primary border-primary' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}
                  onClick={() => setActiveTab('transcript')}
                >
                  Questions
                </button>
              </div>

              {/* Audio Player (Visible only when Reading tab is active and audio exists) */}
              {activeTab === 'dictation' && passage.audioUrl && (
                <div className="py-2 md:py-0 flex items-center gap-3 flex-1 max-w-[280px] ml-auto audio-player-container">
                  <button id="play-pause" className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <i className="fas fa-play text-sm"></i>
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <span id="current-time" className="text-[10px] font-medium text-slate-400 font-mono min-w-[30px]">0:00</span>
                    <div className="flex-1 relative h-1 flex items-center bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer group">
                      <div id="progress" className="absolute left-0 top-0 h-full bg-primary rounded-full pointer-events-none" style={{ width: '0%' }}></div>
                    </div>
                    <span id="duration" className="text-[10px] font-medium text-slate-400 font-mono min-w-[30px]">0:00</span>
                  </div>
                  <button id="speed-btn" className="text-xs font-bold text-slate-500 hover:text-primary px-2 py-1 rounded border border-slate-200 dark:border-slate-700">1x</button>
                  {passage.audioUrl && <audio id="lesson-audio" src={passage.audioUrl} className="hidden"></audio>}
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-10 flex-1 relative">
              {activeTab === 'dictation' && (
                <div className="reading-pane text-sm leading-[1.8] text-slate-700 dark:text-slate-300 space-y-6 font-serif">
                  <HighlightedText
                    text={passage.text}
                    onWordClick={handleVocabularyClick}
                    highlightedWords={passage.vocab?.map(v => v.term) || []}
                    passageVocab={passage.vocab}
                  />

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => navigate('/passages')}
                      className="px-8 py-2.5 bg-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm shadow-md hover:scale-105 active:scale-95"
                    >
                      Finish Reading
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="animate-fadeIn">
                  {loadingQuestions ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                      <p className="text-slate-500">Đang tải câu hỏi...</p>
                    </div>
                  ) : (
                    <QuizSection questions={questions} passageId={passage.id} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Related Lessons */}
        <aside className="lg:col-span-3 space-y-6">
          {relatedPassages.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Bài học liên quan</h2>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate(`/topics/${passage.topicSlug}`); }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  See all
                </a>
              </div>
              <div className="space-y-4">
                {relatedPassages.map((relatedPassage) => (
                  <div
                    key={relatedPassage.id}
                    onClick={() => navigate(`/passage/${relatedPassage.id}`)}
                    className="group flex gap-4 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img
                        alt={relatedPassage.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={relatedPassage.thumbnail || "https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = 'https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-tighter mb-1">
                        {relatedPassage.englishLevel || 'Basic'}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {relatedPassage.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Practice CTA Card */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-sm mb-2">Practice makes perfect</h4>
              <p className="text-xs text-indigo-100 mb-4">Complete this lesson to unlock the vocabulary quiz.</p>
              <button
                onClick={() => navigate('/review')}
                className="bg-white text-indigo-600 text-[11px] font-bold px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
              >
                Go to Quiz
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[100px] select-none">quiz</span>
          </div>
        </aside>
      </div>

      {/* VocabPopup */}
      {showVocabPopup && selectedVocab && (
        <VocabPopup
          anchorRect={anchorRect}
          vocab={selectedVocab}
          onClose={handleClosePopup}
        />
      )}
    </main>
  );
};

export default PassageDetail;