import React, { useEffect, useState } from 'react';
import { Passage, Topic, EnglishLevel } from '../types';
import { passageService } from '../firebase/passageService';
import { userSettingsService } from '../firebase/userSettingsService';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

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
  const { user } = useAuth();
  const { isAdminLoggedIn } = useAdmin();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Load user settings first
      if (user) {
        try {
          const settings = await userSettingsService.getUserSettings(user.uid);
          if (settings) {
            setUserEnglishLevel(settings.englishLevel);
          }
        } catch (error) {
          console.error('Error loading user settings:', error);
        }
      }

      // Load passages
      if (topic?.slug) {
        setLoading(true);
        const data = await passageService.getByTopicSlug(topic.slug);
        
        // Filter passages by user's English level
        const filteredPassages = filterPassagesByLevel(data);
        setPassages(filteredPassages);
        
        setLoading(false);
      }
    };
    load();
  }, [topic?.slug, user]);

  // Filter passages based on user's English level
  const filterPassagesByLevel = (passages: Passage[]): Passage[] => {
    // Admin sees all passages without filtering
    if (isAdminLoggedIn) {
      console.log('🔧 Admin mode: Showing all passages without filtering');
      return passages;
    }
    
    // Regular users get filtered by their English level
    if (!user) return passages; // Show all if not logged in
    
    return passages.filter(passage => {
      // Check if passage has multiple English levels
      if (passage.englishLevels && passage.englishLevels.length > 0) {
        return passage.englishLevels.includes(userEnglishLevel);
      }
      
      // Fallback to single English level
      if (passage.englishLevel) {
        return passage.englishLevel === userEnglishLevel;
      }
      
      // Fallback to old level system (convert to English level)
      const levelMapping: Record<number, EnglishLevel> = {
        1: 'basic',
        2: 'independent', 
        3: 'independent',
        4: 'proficient'
      };
      const mappedLevel = levelMapping[passage.level] || 'basic';
      return mappedLevel === userEnglishLevel;
    });
  };


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

  const getEnglishLevelColor = (englishLevel?: EnglishLevel, level?: number) => {
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return '#ff6b9d'; // Pink for kids 2-4
        case 'kids-5-10': return '#4ecdc4'; // Teal for kids 5-10
        case 'basic': return '#10b981'; // Green for basic
        case 'independent': return '#3b82f6'; // Blue for independent
        case 'proficient': return '#ef4444'; // Red for proficient
        default: return '#6b7280'; // Gray
      }
    }
    // Fallback to old level system
    switch (level) {
      case 1: return '#10b981'; // Green for A1
      case 2: return '#3b82f6'; // Blue for A2
      case 3: return '#f59e0b'; // Orange for B1
      case 4: return '#ef4444'; // Red for B2
      default: return '#6b7280'; // Gray
    }
  };

  const getEnglishLevelText = (englishLevels?: EnglishLevel[], englishLevel?: EnglishLevel, level?: number) => {
    if (englishLevels && englishLevels.length > 0) {
      // Show multiple levels
      if (englishLevels.length === 1) {
        switch (englishLevels[0]) {
          case 'kids-2-4': return '👶 Kids 2-4';
          case 'kids-5-10': return '🧒 Kids 5-10';
          case 'basic': return '🌱 Basic';
          case 'independent': return '🌿 Independent';
          case 'proficient': return '🌳 Proficient';
          default: return 'Basic';
        }
      } else {
        return `📚 ${englishLevels.length} Levels`;
      }
    }
    
    // Fallback to single level
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
                    <span className="passage-views">{passage.vocab?.length || 0} từ vựng</span>
         <span 
           className="passage-level"
           style={{ backgroundColor: getEnglishLevelColor(passage.englishLevels?.[0] || passage.englishLevel, passage.level || 1) }}
         >
           {getEnglishLevelText(passage.englishLevels || undefined, passage.englishLevel, passage.level || 1)}
         </span>
                    <span className="passage-source">Từ vựng</span>
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


