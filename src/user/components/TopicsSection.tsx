import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../../firebase/topicService';
import { passageService } from '../../firebase/passageService';
import { userSettingsService } from '../../firebase/userSettingsService';
import { progressService } from '../../firebase/progressService';
import { Topic, Passage, EnglishLevel } from '../../types';
import { useAuth } from '../contexts/AuthContext';
// User component doesn't need admin context
import LessonCard from './LessonCard';
import TopicTypeSelector, { TopicType } from '../../components/TopicTypeSelector';
import LoginRequiredModal from './LoginRequiredModal';

const TopicsSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // User component doesn't need admin context
  const [topics, setTopics] = useState<Topic[]>([]);
  const [passagesByTopic, setPassagesByTopic] = useState<Record<string, Passage[]>>({});
  const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
  const [passagesLoading, setPassagesLoading] = useState<Record<string, boolean>>({});
  const [selectedTopicType, setSelectedTopicType] = useState<TopicType>('paragraph');
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Filter passages based on user's English level (show all lessons, but mark premium ones)
  const filterPassagesByLevel = useCallback((passages: Passage[]): Passage[] => {
    // Admin sees all passages without filtering
    // User component doesn't need admin context
    if (false) {
      console.log('🔧 Admin mode: Showing all passages without filtering');
      return passages;
    }
    
    // Show all passages, but mark which ones require login
    return passages.filter(passage => {
      // Filter by English level only
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
  }, [userEnglishLevel]);

  const loadPassagesForTopics = useCallback(async (topicsData: Topic[]) => {
    try {
      const passagesMap: Record<string, Passage[]> = {};
      
      for (const topic of topicsData) {
        if (topic.slug) {
          try {
            const passages = await passageService.getByTopicSlug(topic.slug);
            const filteredPassages = filterPassagesByLevel(passages);
            passagesMap[topic.slug] = filteredPassages.slice(0, 4); // Chỉ lấy 4 passages đầu tiên
            
            // Update loading state for this topic
            setPassagesLoading(prev => ({
              ...prev,
              [topic.slug!]: false
            }));
          } catch (error) {
            console.error(`Error loading passages for topic ${topic.slug}:`, error);
            passagesMap[topic.slug] = [];
            
            // Update loading state for this topic
            setPassagesLoading(prev => ({
              ...prev,
              [topic.slug!]: false
            }));
          }
        }
      }
      
      setPassagesByTopic(passagesMap);
    } catch (error) {
      console.error('Error loading passages:', error);
    }
  }, [filterPassagesByLevel]);

  const loadTopics = useCallback(async () => {
    try {
      // Load topics first
      const topicsData = await topicService.getAll();
      setTopics(topicsData);
      
      // Initialize loading state for each topic
      const loadingState: Record<string, boolean> = {};
      topicsData.forEach(topic => {
        if (topic.slug) {
          loadingState[topic.slug] = true;
        }
      });
      setPassagesLoading(loadingState);
      
      // Load passages for each topic
      loadPassagesForTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }, [loadPassagesForTopics]);

  // Load user settings to get English level
  const loadUserSettings = useCallback(async () => {
    if (user) {
      try {
        const settings = await userSettingsService.getUserSettings(user.uid);
        if (settings) {
          setUserEnglishLevel(settings.englishLevel);
          console.log('📚 User English Level:', settings.englishLevel);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    } else {
      // For non-logged in users, use default level
      setUserEnglishLevel('basic');
      console.log('📚 Default English Level for non-logged in user: basic');
    }
  }, [user]);

  // Load user progress to get completed passages
  const loadUserProgress = useCallback(async () => {
    if (user) {
      try {
        const progress = await progressService.getUserProgress(user.uid);
        if (progress && progress.completedPassages) {
          setCompletedPassages(new Set(progress.completedPassages));
          console.log('📊 Completed passages:', progress.completedPassages);
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    loadUserSettings();
    loadUserProgress();
  }, [user, loadUserSettings, loadUserProgress]);

  useEffect(() => {
    // Load topics for both logged in and logged out users
    loadTopics();
  }, [user, userEnglishLevel, loadTopics]);

  // Reload passages when user English level changes
  useEffect(() => {
    if (topics.length > 0) {
      loadPassagesForTopics(topics);
    }
  }, [userEnglishLevel, filterPassagesByLevel, loadPassagesForTopics, topics]);

  // Refresh progress when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadUserProgress();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loadUserProgress]);

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

  const handleTopicTypeChange = (type: TopicType) => {
    setSelectedTopicType(type);
    // TODO: Filter topics based on type if needed
  };

  const handlePremiumClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(false);
    // Trigger login flow
    if (user === null) {
      // This will trigger the login form from AuthContext
      window.location.reload(); // Simple way to trigger login
    }
  };

  return (
    <div className="topics-section-wrapper">
      <TopicTypeSelector 
        selectedType={selectedTopicType}
        onTypeChange={handleTopicTypeChange}
      />
      
      <div className="topics-section container">
      
      {topics.length === 0 ? (
        <div className="topics-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chủ đề...</p>
        </div>
      ) : (
        topics.map((topic) => {
        const topicPassages = topic.slug ? passagesByTopic[topic.slug] || [] : [];
        const isPassagesLoading = topic.slug ? passagesLoading[topic.slug] : false;
        
        return (
          <section key={topic.id} className="topic-section">
            <div className="section-header">
              <h2 className="section-title">
                {getTopicIcon(topic.slug)} {topic.name} <span className="count">
                  {isPassagesLoading ? '...' : `(${topicPassages.length} bài học)`}
                </span>
              </h2>
              <a 
                href="#" 
                className="view-all"
                onClick={(e) => {
                  e.preventDefault();
                  if (topic.slug) navigate(`/topics/${topic.slug}`);
                }}
              >
                Xem tất cả →
              </a>
            </div>

            <div className="lessons-grid">
              {isPassagesLoading ? (
                // Hiển thị loading cho passages của topic này
                <div className="topic-loading">
                  <div className="loading-spinner-small"></div>
                  <span>Đang tải bài học...</span>
                </div>
              ) : topicPassages.length > 0 ? (
                // Hiển thị passages với LessonCard mới
                topicPassages.map((passage: Passage) => (
                  <LessonCard
                    key={passage.id}
                    passage={passage}
                    isLearned={completedPassages.has(passage.id)}
                    isLoggedIn={!!user}
                    onPremiumClick={handlePremiumClick}
                    onClick={() => navigate(`/passage/${passage.id}`)}
                  />
                ))
              ) : (
                // Hiển thị thông báo không có passage
                <div className="no-passages">
                  <span>Chưa có bài học nào</span>
                </div>
              )}
            </div>
          </section>
        );
        })
      )}
      </div>
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
      />
    </div>
  );
};

export default TopicsSection;
