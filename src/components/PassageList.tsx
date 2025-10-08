import React, { useEffect, useState } from 'react';
import { Passage, Topic } from '../types';
import { passageService } from '../firebase/passageService';

interface PassageListProps {
  topic: Topic;
  onBack: () => void;
  onOpen: (passage: Passage) => void;
  onEdit?: (passage: Passage) => void;
  onDelete?: (passage: Passage) => void; // Added optional onDelete prop
  onManageVocab?: (passage: Passage) => void; // Added optional onManageVocab prop
}

const PassageList: React.FC<PassageListProps> = ({ 
  topic, 
  onBack, 
  onOpen,
  onEdit,
  onDelete,
  onManageVocab
}) => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (topic?.slug) {
        setLoading(true);
        const data = await passageService.getByTopicSlug(topic.slug);
        setPassages(data);
        
        setLoading(false);
      }
    };
    load();
  }, [topic?.slug]);


  if (loading) {
    return (
      <div className="topics-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  const getTopicIcon = (slug: string | undefined) => {
    switch (slug) {
      case 'nature': return '🌿';
      case 'travel': return '✈️';
      case 'daily-activities': return '🏠';
      default: return '📚';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return '#10b981'; // Green for A1
      case 2: return '#3b82f6'; // Blue for A2
      case 3: return '#f59e0b'; // Orange for B1
      case 4: return '#ef4444'; // Red for B2
      default: return '#6b7280'; // Gray
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'A1';
      case 2: return 'A2';
      case 3: return 'B1';
      case 4: return 'B2';
      default: return 'A1';
    }
  };

  return (
    <div className="topics-section">
      <div className="topic-group">
        <div className="topic-header">
          <div className="topic-title">
            <span className="topic-icon">{getTopicIcon(topic.slug)}</span>
            <h2>{topic.name}</h2>
            <span className="lesson-count">({passages.length} bài học)</span>
          </div>
          <button 
            className="view-all-button"
            onClick={onBack}
          >
            ← Quay lại
          </button>
        </div>

        <div className="passages-grid">
          {passages.map((passage) => (
            <div 
              key={passage.id} 
              className="passage-card-parroto"
            >
              <div className="passage-card-content" onClick={() => onOpen(passage)}>
                <div className="passage-thumbnail">
                  {passage.thumbnail ? (
                    <img src={passage.thumbnail} alt={passage.title} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      {getTopicIcon(topic.slug)}
                    </div>
                  )}
                </div>
                
                <div className="passage-content">
                  <div className="passage-meta">
                    <span className="passage-views">0</span>
                    <span 
                      className="passage-level"
                      style={{ backgroundColor: getDifficultyColor(passage.level || 1) }}
                    >
                      {getDifficultyText(passage.level || 1)}
                    </span>
                    <span className="passage-source">Youtube</span>
                    <span className="passage-duration">2:30 phút</span>
                  </div>
                  
                  <h3 className="passage-title">{passage.title}</h3>
                </div>
              </div>
              
              {(onEdit || onDelete || onManageVocab) && (
                <div className="passage-admin-actions">
                  {onEdit && (
                    <button 
                      className="edit-passage-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(passage);
                      }}
                      title="Chỉnh sửa bài học"
                    >
                      ✏️
                    </button>
                  )}
                  {onManageVocab && (
                    <button 
                      className="manage-vocab-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageVocab(passage);
                      }}
                      title="Quản lý từ vựng"
                    >
                      📚
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="delete-passage-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(passage);
                      }}
                      title="Xóa bài học"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassageList;


