import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Topic } from '../types';
import { passageService } from '../firebase/passageService';
import { questionService } from '../firebase/questionService';

interface PassageListProps {
  topic: Topic;
  onBack: () => void;
  onOpen: (passage: Passage) => void;
  onCreatePassage?: () => void;
  onEditPassage?: (passage: Passage) => void;
  onDeletePassage?: (passage: Passage) => void;
}

const PassageList: React.FC<PassageListProps> = ({ 
  topic, 
  onBack, 
  onOpen, 
  onCreatePassage, 
  onEditPassage, 
  onDeletePassage 
}) => {
  const navigate = useNavigate();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [passageStats, setPassageStats] = useState<Record<string, { questions: number; vocabularies: number }>>({});
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (topic?.slug) {
        setLoading(true);
        const data = await passageService.getByTopicSlug(topic.slug);
        setPassages(data);
        
        // Load stats for each passage
        setStatsLoading(true);
        const stats: Record<string, { questions: number; vocabularies: number }> = {};
        for (const passage of data) {
          try {
            const questions = await questionService.getByPassageId(passage.id);
            
            // Count vocabularies from passage.vocab array if it exists
            let vocabCount = 0;
            if (passage.vocab && Array.isArray(passage.vocab)) {
              vocabCount = passage.vocab.length;
            }
            
            stats[passage.id] = {
              questions: questions.length,
              vocabularies: vocabCount
            };
            
            console.log(`📊 Passage ${passage.id} stats:`, {
              title: passage.title,
              questions: questions.length,
              vocabularies: vocabCount,
              hasVocabArray: !!passage.vocab,
              vocabArrayLength: passage.vocab?.length || 0
            });
          } catch (error) {
            console.error(`Error loading stats for passage ${passage.id}:`, error);
            stats[passage.id] = { questions: 0, vocabularies: 0 };
          }
        }
        setPassageStats(stats);
        setStatsLoading(false);
        setLoading(false);
      }
    };
    load();
  }, [topic?.slug]);

  // Function to refresh stats (can be called when returning from management pages)
  const refreshStats = async () => {
    if (passages.length === 0) return;
    
    setStatsLoading(true);
    const stats: Record<string, { questions: number; vocabularies: number }> = {};
    for (const passage of passages) {
      try {
        const questions = await questionService.getByPassageId(passage.id);
        
        // Count vocabularies from passage.vocab array if it exists
        let vocabCount = 0;
        if (passage.vocab && Array.isArray(passage.vocab)) {
          vocabCount = passage.vocab.length;
        }
        
        stats[passage.id] = {
          questions: questions.length,
          vocabularies: vocabCount
        };
      } catch (error) {
        console.error(`Error refreshing stats for passage ${passage.id}:`, error);
        stats[passage.id] = { questions: 0, vocabularies: 0 };
      }
    }
    setPassageStats(stats);
    setStatsLoading(false);
  };

  // Refresh stats when component becomes visible (when returning from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && passages.length > 0) {
        refreshStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [passages]);

  if (loading) {
    return (
      <div className="passage-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải đoạn văn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="passage-list-container">
      <div className="passage-header">
        <button className="modern-back-button" onClick={onBack}>
          <span className="back-icon">←</span>
          <span>Quay lại</span>
        </button>
        
        <div className="topic-info">
          <div className="topic-icon">
            {topic.slug === 'nature' ? '🌿' : topic.slug === 'travel' ? '✈️' : '🏠'}
          </div>
          <div className="topic-details">
            <h1 className="topic-title">{topic.name}</h1>
            <p className="topic-description">{topic.description}</p>
            <div className="passage-count">
              {passages.length} đoạn văn
            </div>
          </div>
          {onCreatePassage && (
            <button 
              className="create-passage-button"
              onClick={onCreatePassage}
              title="Thêm đoạn văn mới"
            >
              <span className="create-icon">+</span>
              <span>Tạo đoạn văn mới</span>
            </button>
          )}
        </div>
      </div>

      <div className="passages-grid">
        {passages.map((passage, index) => (
          <div 
            key={passage.id} 
            className="modern-passage-card"
            onClick={() => onOpen(passage)}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              cursor: 'pointer' 
            }}
          >
            <div className="card-header">
              <div className="card-number">#{index + 1}</div>
              <div className="card-actions">
                <button 
                  className="action-button read-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(passage);
                  }}
                  title="Đọc đoạn văn"
                >
                  📖
                </button>
                {onEditPassage && (
                  <button 
                    className="action-button edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPassage(passage);
                    }}
                    title="Sửa đoạn văn"
                  >
                    ✏️
                  </button>
                )}
                {onDeletePassage && (
                  <button 
                    className="action-button delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePassage(passage);
                    }}
                    title="Xóa đoạn văn"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            
            <div className="card-content">
              <h3 className="passage-title">{passage.title}</h3>
              <p className="passage-excerpt">{passage.excerpt}</p>
            </div>
            
            <div className="card-stats">
              <div className="stat-item">
                <span className="stat-icon">❓</span>
                <span className="stat-text">
                  {statsLoading ? '...' : (passageStats[passage.id]?.questions || 0)} câu hỏi
                </span>
              </div>
              <div 
                className="stat-item"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/vocabulary/${passage.id}`);
                }}
                title="Quản lý từ vựng của đoạn văn"
              >
                <span className="stat-icon">📚</span>
                <span className="stat-text">
                  {statsLoading ? '...' : (passageStats[passage.id]?.vocabularies || 0)} từ vựng
                </span>
              </div>
            </div>
            
            <div className="card-footer">
              <button 
                className="manage-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/questions/${passage.id}`);
                }}
              >
                <span>Quản lý câu hỏi</span>
                <span className="button-icon">→</span>
              </button>
            </div>
            
            <div className="card-gradient"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PassageList;


