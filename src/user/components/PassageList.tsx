import React, { useEffect, useState, useCallback } from 'react';
import { Passage, Topic, EnglishLevel } from '../../types';
import { passageService } from '../../firebase/passageService';
import { userSettingsService } from '../../firebase/userSettingsService';
import { useAuth } from '../contexts/AuthContext';
// User component doesn't need admin context

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
  // User component doesn't need admin context
  const [passages, setPassages] = useState<Passage[]>([]);
  const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
  const [loading, setLoading] = useState(true);

  // Filter passages based on user's English level
  const filterPassagesByLevel = useCallback((passages: Passage[]): Passage[] => {
    // Admin sees all passages without filtering
    // User component doesn't need admin context
    if (false) {
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
  }, [user, userEnglishLevel]);

  useEffect(() => {
    const loadUserSettings = async () => {
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
    };
    loadUserSettings();
  }, [user]);

  useEffect(() => {
    const loadPassages = async () => {
      if (topic?.slug) {
        setLoading(true);
        const data = await passageService.getByTopicSlug(topic.slug);

        // Filter passages by user's English level (admin sees all)
        const filteredPassages = filterPassagesByLevel(data);
        setPassages(filteredPassages);

        setLoading(false);
      }
    };
    loadPassages();
  }, [topic?.slug, user, userEnglishLevel, filterPassagesByLevel]);

  // Tooltip positioning effect
  useEffect(() => {
    const tooltips = document.querySelectorAll(".tooltip");

    const handleMouseEnter = (tooltip: Element) => {
      const tooltipText = tooltip.querySelector(".tooltip-text") as HTMLElement;
      if (!tooltipText) return;

      const rect = tooltipText.getBoundingClientRect();

      // Nếu tooltip bị cắt bên phải
      if (rect.right > window.innerWidth) {
        tooltipText.style.left = "auto";
        tooltipText.style.right = "0";
        tooltipText.style.transform = "translateX(0)";
      }

      // Nếu tooltip bị cắt bên trái
      if (rect.left < 0) {
        tooltipText.style.left = "0";
        tooltipText.style.transform = "translateX(0)";
      }
    };

    const handleMouseLeave = (tooltip: Element) => {
      const tooltipText = tooltip.querySelector(".tooltip-text") as HTMLElement;
      if (tooltipText) {
        tooltipText.removeAttribute("style");
      }
    };

    tooltips.forEach((tooltip) => {
      tooltip.addEventListener("mouseenter", () => handleMouseEnter(tooltip));
      tooltip.addEventListener("mouseleave", () => handleMouseLeave(tooltip));
    });

    return () => {
      tooltips.forEach((tooltip) => {
        tooltip.removeEventListener("mouseenter", () => handleMouseEnter(tooltip));
        tooltip.removeEventListener("mouseleave", () => handleMouseLeave(tooltip));
      });
    };
  }, [passages]);


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
      // Return text for the first level (since we're now handling multiple levels separately)
      switch (englishLevels[0]) {
        case 'kids-2-4': return 'Kids 2-4';
        case 'kids-5-10': return 'Kids 5-10';
        case 'basic': return 'Basic';
        case 'independent': return 'Independent';
        case 'proficient': return 'Proficient';
        default: return 'Basic';
      }
    }
    
    // Fallback to single level
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return 'Kids 2-4';
        case 'kids-5-10': return 'Kids 5-10';
        case 'basic': return 'Basic';
        case 'independent': return 'Independent';
        case 'proficient': return 'Proficient';
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

  const getLevelClass = (englishLevels?: EnglishLevel[], englishLevel?: EnglishLevel, level?: number) => {
    // Handle single level from array
    if (englishLevels && englishLevels.length > 0) {
      switch (englishLevels[0]) {
        case 'kids-2-4': return 'beginner';
        case 'kids-5-10': return 'beginner';
        case 'basic': return 'beginner';
        case 'independent': return 'intermediate';
        case 'proficient': return 'proficient';
        default: return 'beginner';
      }
    }
    
    if (englishLevel) {
      switch (englishLevel) {
        case 'kids-2-4': return 'beginner';
        case 'kids-5-10': return 'beginner';
        case 'basic': return 'beginner';
        case 'independent': return 'intermediate';
        case 'proficient': return 'proficient';
        default: return 'beginner';
      }
    }
    
    // Fallback to level number
    if (level) {
      switch (level) {
        case 1: return 'beginner';
        case 2: return 'beginner';
        case 3: return 'intermediate';
        case 4: return 'proficient';
        default: return 'beginner';
      }
    }
    
    return 'beginner';
  };

  return (
    <div className="topics-section">
      <div className="topic-group">

        <div className="passages-grid">
          {passages.map((passage) => (
            <div 
              key={passage.id} 
              className="lesson-card"
            >
              <div className="lesson-thumbnail">
                {passage.thumbnail ? (
                  <img src={passage.thumbnail} alt={passage.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    {getTopicIcon(topic.slug)}
                  </div>
                )}

                <div className="card-actions">
                  {onManageVocab && (
                    <div className="tooltip">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageVocab(passage);
                        }}
                      >
                        <i className="fa-solid fa-language"></i>
                      </button>
                      <span className="tooltip-text">Quản lý từ vựng</span>
                    </div>
                  )}
                  <div className="tooltip">
                    <button>
                      <i className="fa-solid fa-circle-question"></i>
                    </button>
                    <span className="tooltip-text">Quản lý câu hỏi</span>
                  </div>
                  {onEdit && (
                    <div className="tooltip">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(passage);
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <span className="tooltip-text">Chỉnh sửa bài học</span>
                    </div>
                  )}
                  {onDelete && (
                    <div className="tooltip">
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(passage);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                      <span className="tooltip-text">Xóa bài học</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson-info" onClick={() => onOpen(passage)}>
                <div className="lesson-tags">
                  <span className="tag-count">
                    <i className="fa-solid fa-book"></i> {passage.vocab?.length || 0} từ vựng
                  </span>
                  <span className="tag-questions">
                    <i className="fa-solid fa-circle-question"></i> {passage.questions?.length || 0} câu hỏi
                  </span>
                  {passage.englishLevels && passage.englishLevels.length > 0 ? (
                    passage.englishLevels.map((level, index) => (
                      <span 
                        key={index}
                        className={`tag-level ${getLevelClass([level], undefined, undefined)}`}
                      >
                        <i className="fa-solid fa-seedling"></i> {getEnglishLevelText([level], undefined, undefined)}
                      </span>
                    ))
                  ) : (
                    <span 
                      className={`tag-level ${getLevelClass(undefined, passage.englishLevel, passage.level || 1)}`}
                    >
                      <i className="fa-solid fa-seedling"></i> {getEnglishLevelText(undefined, passage.englishLevel, passage.level || 1)}
                    </span>
                  )}
                </div>

                <h3 className="lesson-title">{passage.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassageList;


