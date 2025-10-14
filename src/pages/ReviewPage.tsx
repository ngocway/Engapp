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
          {/* Page Header */}
          <div className="topic-group">
            {/* Simple Tabs */}
            <div className="review-tabs-container">
              <button 
                className={`review-tab-button ${activeTab === 'passages' ? 'active' : ''}`}
                onClick={() => setActiveTab('passages')}
              >
                <span className="tab-icon">📖</span>
                <span className="tab-text">Đoạn văn đã học</span>
                <span className="tab-count">{completedPassages.length}</span>
              </button>
              <button 
                className={`review-tab-button ${activeTab === 'vocabulary' ? 'active' : ''}`}
                onClick={() => setActiveTab('vocabulary')}
              >
                <span className="tab-icon">🎓</span>
                <span className="tab-text">Từ vựng đã học</span>
                <span className="tab-count">{learnedWords.length}</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'passages' ? (
              <div className="passages-tab">
                {completedPassages.length === 0 ? (
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
                  <div className="passages-grid">
                    {completedPassages.map((passage) => (
                      <div 
                        key={passage.id}
                        className="passage-card-parroto"
                        onClick={() => handlePassageClick(passage.id)}
                      >
                        <div className="passage-thumbnail">
                          {passage.thumbnail ? (
                            <img src={passage.thumbnail} alt={passage.title} />
                          ) : (
                            <div className="thumbnail-placeholder">
                              📖
                            </div>
                          )}
                        </div>
                        
                        <div className="passage-info">
                          <div className="passage-meta">
                            <span className="view-count">Đã hoàn thành</span>
                            <span className="difficulty-badge" style={{ backgroundColor: '#10b981' }}>
                              ✅
                            </span>
                            <span className="source">Review</span>
                          </div>
                          
                          <h3 className="passage-title">{passage.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="vocabulary-tab">
                {learnedWords.length === 0 ? (
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
                  <div className="passages-grid">
                    {learnedWords.map((vocab) => {
                      // Determine difficulty level for this word
                      const getDifficultyInfo = () => {
                        if (userVocabDifficulty.hard.includes(vocab.word?.toLowerCase() || '')) {
                          return { level: 'Hard', color: '#ff7675', icon: '🔴' };
                        } else if (userVocabDifficulty.normal.includes(vocab.word?.toLowerCase() || '')) {
                          return { level: 'Normal', color: '#fdcb6e', icon: '🟡' };
                        } else if (userVocabDifficulty.easy.includes(vocab.word?.toLowerCase() || '')) {
                          return { level: 'Easy', color: '#55efc4', icon: '🟢' };
                        } else {
                          return null; // No difficulty set
                        }
                      };
                      
                      const difficulty = getDifficultyInfo();
                      
                      return (
                        <div 
                          key={vocab.id} 
                          className="passage-card-parroto"
                          onClick={(e) => handleVocabClick(vocab, e)}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                          }}
                          title="Click để ôn tập từ vựng"
                        >
                          <div className="passage-thumbnail">
                            {vocab.image ? (
                              <img src={vocab.image} alt={vocab.word} />
                            ) : (
                              <div className="thumbnail-placeholder">
                                🎓
                              </div>
                            )}
                          </div>
                          
                          <div className="passage-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <h3 className="passage-title" style={{ margin: 0 }}>{vocab.word}</h3>
                              {difficulty && (
                                <span 
                                  style={{ 
                                    backgroundColor: difficulty.color,
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={`Độ khó: ${difficulty.level}`}
                                >
                                  {difficulty.icon} {difficulty.level}
                                </span>
                              )}
                            </div>
                            <p className="vocab-meaning">{vocab.meaning}</p>
                            {vocab.pronunciation && (
                              <p className="vocab-pronunciation">{vocab.pronunciation}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        
        {/* Vocabulary Flashcard for Review */}
        {showVocabFlashcard && selectedVocabTerm && (
          <VocabFlashcard
            term={selectedVocabTerm}
            passageVocab={passageVocab}
            onClose={handleCloseFlashcard}
            position={flashcardPosition}
          />
        )}
      </div>
    </>
  );
};

export default ReviewPage;