import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Vocabulary } from '../types';
import { progressService } from '../firebase/progressService';
import { passageService } from '../firebase/passageService';
import { vocabularyService } from '../firebase/vocabularyService';
import { useAuth } from '../contexts/AuthContext';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'passages' | 'vocabulary'>('passages');
  const [completedPassages, setCompletedPassages] = useState<Passage[]>([]);
  const [learnedWords, setLearnedWords] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Load learned vocabulary
        if (progress.learnedWords && progress.learnedWords.length > 0) {
          const allVocab = await vocabularyService.getAllVocabulary();
          const learnedVocabDetails = allVocab.filter(v => progress.learnedWords?.includes(v.id));
          setLearnedWords(learnedVocabDetails);
        } else {
          setLearnedWords([]);
        }
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
                    {learnedWords.map((vocab) => (
                      <div key={vocab.id} className="passage-card-parroto">
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
                          <div className="passage-meta">
                            <span className="view-count">Đã học</span>
                            <span className="difficulty-badge" style={{ backgroundColor: '#3b82f6' }}>
                              ✅
                            </span>
                            <span className="source">Vocabulary</span>
                          </div>
                          
                          <h3 className="passage-title">{vocab.word}</h3>
                          <p className="vocab-meaning">{vocab.meaning}</p>
                          {vocab.pronunciation && (
                            <p className="vocab-pronunciation">{vocab.pronunciation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  );
};

export default ReviewPage;