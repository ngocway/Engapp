import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Vocabulary } from '../types';
import { progressService } from '../firebase/progressService';
import { passageService } from '../firebase/passageService';
import { vocabularyService } from '../firebase/vocabularyService';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';
import { VocabFlashcard } from '../components/VocabFlashcard';
import { PassageVocab } from '../types';
import LessonCard from '../components/LessonCard';
import VocabCard from '../components/VocabCard';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'passages' | 'vocabulary'>('passages');
  const [completedPassages, setCompletedPassages] = useState<Passage[]>([]);
  const [learnedWords, setLearnedWords] = useState<Vocabulary[]>([]);
  const [userVocabDifficulty, setUserVocabDifficulty] = useState<Record<VocabDifficulty, string[]>>({
    easy: [],
    normal: [],
    hard: []
  });
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');
  
  // State for vocabulary flashcard
  const [showVocabFlashcard, setShowVocabFlashcard] = useState(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState<string>('');
  const [flashcardPosition, setFlashcardPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [passageVocab, setPassageVocab] = useState<PassageVocab[]>([]);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  // Refresh data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadUserProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const loadLearnedVocabulary = async () => {
    try {
      console.log('🔄 Loading learned vocabulary...');
      
      // Get vocabulary from userVocabService (when user clicks Easy/Normal/Hard)
      const userVocabData = await userVocabService.getAll(user!.uid);
      console.log('📚 User vocab difficulty data:', userVocabData);
      setUserVocabDifficulty(userVocabData);
      
      // Get all vocabulary terms that user has interacted with
      const allUserVocabTerms = [
        ...userVocabData.easy,
        ...userVocabData.normal,
        ...userVocabData.hard
      ];
      console.log('📝 All user vocab terms:', allUserVocabTerms);
      
      // Get progress data for additional learned words
      const progress = await progressService.getUserProgress(user!.uid);
      const progressWords = progress?.learnedWords || [];
      console.log('📊 Progress learned words:', progressWords);
      
      // Combine both sources and get unique terms
      const combinedTerms = [...allUserVocabTerms, ...progressWords];
      const uniqueTermsSet = new Set(combinedTerms);
      const allLearnedTerms = Array.from(uniqueTermsSet);
      console.log('🎯 All unique learned terms:', allLearnedTerms);
      
      if (allLearnedTerms.length > 0) {
        // Get vocabulary details from vocabularyService
        const allVocab = await vocabularyService.getAllVocabulary();
        console.log('📖 All available vocabulary:', allVocab.length, 'words');
        
        // Filter vocabulary that user has learned
        const learnedVocabDetails = allVocab.filter(vocab => 
          allLearnedTerms.includes(vocab.id) || 
          allLearnedTerms.includes(vocab.word?.toLowerCase())
        );
        
        console.log('✅ Found learned vocabulary details:', learnedVocabDetails.length, 'words');
        console.log('📝 Learned words:', learnedVocabDetails.map(v => v.word));
        
        setLearnedWords(learnedVocabDetails);
      } else {
        console.log('📝 No learned vocabulary found');
        setLearnedWords([]);
      }
    } catch (error) {
      console.error('❌ Error loading learned vocabulary:', error);
      setLearnedWords([]);
    }
  };

  const loadUserProgress = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading user progress for user:', user?.uid);
      console.log('🔍 Current user object:', user);
      console.log('🔍 User UID type:', typeof user?.uid);
      console.log('🔍 User UID length:', user?.uid?.length);
      
      const progress = await progressService.getUserProgress(user!.uid);
      console.log('📊 User progress:', progress);
      console.log('🔍 Progress type:', typeof progress);
      console.log('🔍 Progress keys:', progress ? Object.keys(progress) : 'null');
      
      if (progress) {
        // Load completed passages
        console.log('📚 Completed passages IDs:', progress.completedPassages);
        
        if (progress.completedPassages && progress.completedPassages.length > 0) {
          const passages: Passage[] = [];
          
          // Get all available passages to find matches
          const allPassages = await passageService.getAll();
          console.log('📖 All available passages:', allPassages.map(p => ({ id: p.id, title: p.title })));
          
          for (const passageId of progress.completedPassages) {
            console.log('🔍 Looking for passage with ID:', passageId);
            console.log('🔍 Passage ID type:', typeof passageId);
            console.log('🔍 Passage ID length:', passageId?.length);
            
            // Only use Document ID - this is the standard approach
            const passage = await passageService.getPassageById(passageId);
            
            if (passage) {
              console.log('✅ Found passage by Document ID:', passage.title);
              passages.push(passage);
            } else {
              console.log('❌ Passage not found for Document ID:', passageId, 'Skipping...');
              console.log('⚠️ This passage ID may be invalid or the passage was deleted');
            }
          }
          
          console.log('✅ All passages loaded:', passages.length, 'passages');
          console.log('📝 Setting completedPassages state to:', passages.map(p => p.title));
          setCompletedPassages(passages);
          console.log('🎯 State update completed');
        } else {
          console.log('📝 No completed passages found');
          setCompletedPassages([]);
        }

        // Load learned vocabulary from both sources
        await loadLearnedVocabulary();
      } else {
        console.log('❌ No progress found for user');
        setCompletedPassages([]);
        setLearnedWords([]);
      }
    } catch (error) {
      console.error('❌ Error loading user progress for review:', error);
      setCompletedPassages([]);
      setLearnedWords([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePassageClick = (passageId: string) => {
    navigate(`/passage/${passageId}`);
  };


  // Hàm xử lý khi click vào từ vựng để ôn tập
  const handleVocabClick = (vocab: Vocabulary, event: React.MouseEvent) => {
    setSelectedVocabTerm(vocab.word);
    
    // Đặt flashcard ở chính giữa màn hình
    setFlashcardPosition(undefined);
    
    // Tạo PassageVocab từ Vocabulary để tương thích với VocabFlashcard
    const vocabForFlashcard: PassageVocab = {
      term: vocab.word,
      meaning: vocab.meaning || '',
      definitionEn: vocab.definitionEn || '',
      pronunciation: vocab.pronunciation || '',
      partOfSpeech: vocab.partOfSpeech || '',
      image: vocab.image || '',
      audio: '', // Vocabulary type doesn't have audio property
      examples: vocab.examples || [],
      phonetics: {
        us: vocab.pronunciation || '',
        uk: vocab.pronunciation || ''
      }
    };
    
    setPassageVocab([vocabForFlashcard]);
    setShowVocabFlashcard(true);
  };

  // Hàm đóng flashcard
  const handleCloseFlashcard = () => {
    setShowVocabFlashcard(false);
    setSelectedVocabTerm('');
    setFlashcardPosition(undefined);
    setPassageVocab([]);
  };

  // Hàm xử lý khi kết thúc practice session
  const handlePracticeEnd = async () => {
    console.log('🔄 Practice session ended, reloading vocabulary data...');
    // Reload learned vocabulary để cập nhật difficulty badges
    await loadLearnedVocabulary();
  };

  // Filter functions
  const getFilteredPassages = () => {
    let filtered = completedPassages;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(passage => 
        passage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passage.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by difficulty (for now, all passages are considered completed)
    // In the future, we could add difficulty tracking for passages
    
    return filtered;
  };

  const getFilteredVocabulary = () => {
    let filtered = learnedWords;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(vocab => 
        vocab.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.definitionEn?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(vocab => {
        const wordLower = vocab.word?.toLowerCase() || '';
        return userVocabDifficulty[selectedDifficulty].includes(wordLower);
      });
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="topics-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Đang tải dữ liệu ôn tập...</h2>
        </div>
      </div>
    );
  }

  // Debug render
  console.log('🎨 RENDERING ReviewPage:');
  console.log('🎨 - completedPassages.length:', completedPassages.length);
  console.log('🎨 - completedPassages:', completedPassages.map(p => p.title));
  console.log('🎨 - loading:', loading);

  return (
    <>
      <div className="topics-section">
          {/* Search and Filter Section */}
          <div className="search-filter-wrapper">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                id="searchInput"
                placeholder="Tìm kiếm bài học hoặc từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button 
                className={`filter-btn ${selectedDifficulty === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('all')}
              >
                Tất cả
              </button>
              <button 
                className={`filter-btn ${selectedDifficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
              >
                Easy
              </button>
              <button 
                className={`filter-btn ${selectedDifficulty === 'normal' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('normal')}
              >
                Normal
              </button>
              <button 
                className={`filter-btn ${selectedDifficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
              >
                Hard
              </button>
            </div>
          </div>

          {/* Page Header */}
          <div className="topic-group">
            {/* Tabs */}
            <div className="tabs-container">
              <div className="tab-header">
                <button 
                  className={`tab-btn ${activeTab === 'passages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('passages')}
                >
                  <i className="fa-solid fa-book-open"></i>
                  Đoạn văn đã học
                  <span className="badge">{getFilteredPassages().length}</span>
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'vocabulary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vocabulary')}
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                  Từ vựng đã học
                  <span className="badge">{getFilteredVocabulary().length}</span>
                </button>
              </div>

              <button 
                className="review-all-btn"
                onClick={() => {
                  // Start practice with filtered learned words
                  const filteredVocab = getFilteredVocabulary();
                  if (filteredVocab.length > 0) {
                    // Create practice session with filtered learned words
                    const practiceVocab: PassageVocab[] = filteredVocab.map(vocab => ({
                      term: vocab.word,
                      meaning: vocab.meaning || '',
                      definitionEn: vocab.definitionEn || '',
                      pronunciation: vocab.pronunciation || '',
                      partOfSpeech: vocab.partOfSpeech || '',
                      image: vocab.image || '',
                      audio: '', // Vocabulary type doesn't have audio property
                      examples: vocab.examples || [],
                      phonetics: {
                        us: vocab.pronunciation || '',
                        uk: vocab.pronunciation || ''
                      }
                    }));
                    
                    setPassageVocab(practiceVocab);
                    setSelectedVocabTerm(practiceVocab[0]?.term || '');
                    setFlashcardPosition(undefined); // Center the flashcard
                    setShowVocabFlashcard(true);
                  }
                }}
              >
                <i className="fa-solid fa-bullseye"></i>
                Ôn tập từ vựng ({getFilteredVocabulary().length} từ)
              </button>
            </div>

            {/* Tab Content */}
            <div className={`tab-body ${activeTab === 'passages' ? 'active' : ''}`} id="passages">
              {getFilteredPassages().length === 0 ? (
                <div className="empty-state-topics">
                  <div className="empty-icon">📝</div>
                  <h3>Chưa có đoạn văn nào</h3>
                  <p>Bạn chưa hoàn thành đoạn văn nào</p>
                  <p className="empty-subtitle">Hãy đọc và trả lời câu hỏi để ôn tập nhé!</p>
                  <button 
                    className="view-all-button"
                    onClick={() => navigate('/topics')}
                  >
                    Bắt đầu học ngay →
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {getFilteredPassages().map((passage) => (
                    <LessonCard
                      key={passage.id}
                      passage={passage}
                      isLearned={true}
                      onClick={() => handlePassageClick(passage.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className={`tab-body ${activeTab === 'vocabulary' ? 'active' : ''}`} id="vocabulary">
              {getFilteredVocabulary().length === 0 ? (
                <div className="empty-state-topics">
                  <div className="empty-icon">🎓</div>
                  <h3>Chưa có từ vựng nào</h3>
                  <p>Bạn chưa học từ vựng nào</p>
                  <p className="empty-subtitle">Hãy học từ vựng trong các đoạn văn nhé!</p>
                  <button 
                    className="view-all-button"
                    onClick={() => navigate('/topics')}
                  >
                    Bắt đầu học ngay →
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {getFilteredVocabulary().map((vocab) => {
                    // Determine difficulty level for this word
                    const getDifficultyLevel = (): 'easy' | 'normal' | 'hard' | null => {
                      if (userVocabDifficulty.hard.includes(vocab.word?.toLowerCase() || '')) {
                        return 'hard';
                      } else if (userVocabDifficulty.normal.includes(vocab.word?.toLowerCase() || '')) {
                        return 'normal';
                      } else if (userVocabDifficulty.easy.includes(vocab.word?.toLowerCase() || '')) {
                        return 'easy';
                      } else {
                        return null; // No difficulty set
                      }
                    };
                    
                    const difficulty = getDifficultyLevel();
                    
                    return (
                      <VocabCard
                        key={vocab.id}
                        vocab={vocab}
                        difficulty={difficulty}
                        onClick={(e) => handleVocabClick(vocab, e)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        
        {/* Vocabulary Flashcard for Review */}
        {showVocabFlashcard && selectedVocabTerm && (
          <VocabFlashcard
            term={selectedVocabTerm}
            passageVocab={passageVocab}
            onClose={handleCloseFlashcard}
            position={flashcardPosition}
            isPracticeMode={passageVocab.length > 1}
            onPracticeEnd={handlePracticeEnd}
          />
        )}
      </div>
    </>
  );
};

export default ReviewPage;