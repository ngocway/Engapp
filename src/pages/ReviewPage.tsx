import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Vocabulary } from '../types';
import { progressService } from '../firebase/progressService';
import { topicService } from '../firebase/topicService';
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

  const loadUserProgress = async () => {
    setLoading(true);
    try {
      const progress = await progressService.getUserProgress(user!.uid);
      if (progress) {
        // Load completed passages
        if (progress.completedPassages && progress.completedPassages.length > 0) {
          const passages: Passage[] = [];
          for (const passageId of progress.completedPassages) {
            const passage = await topicService.getPassageById(passageId);
            if (passage) {
              passages.push(passage);
            }
          }
          setCompletedPassages(passages);
        } else {
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
      }
    } catch (error) {
      console.error('Error loading user progress for review:', error);
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