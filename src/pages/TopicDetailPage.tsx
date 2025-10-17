import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../firebase/topicService';
import { passageService } from '../firebase/passageService';
import { userSettingsService } from '../firebase/userSettingsService';
import { progressService } from '../firebase/progressService';
import { Topic, Passage, EnglishLevel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import LessonCard from '../components/LessonCard';
import Header from '../components/Header';

type TabType = 'topics' | 'review';

const TopicDetailPage: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdminLoggedIn } = useAdmin();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('topics');
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());

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

  const loadTopic = async () => {
    if (!topicSlug) return;
    
    try {
      setLoading(true);
      
      // Load topic information
      const topicDataArray = await topicService.getBySlug(topicSlug);
      if (!topicDataArray || topicDataArray.length === 0) {
        console.error('❌ Topic not found:', topicSlug);
        navigate('/');
        return;
      }
      setTopic(topicDataArray[0]); // Lấy topic đầu tiên
      
      // Load passages for this topic
      const allPassages = await passageService.getByTopicSlug(topicSlug);
      const filteredPassages = filterPassagesByLevel(allPassages);
      setPassages(filteredPassages);
      
      console.log(`📚 Loaded ${filteredPassages.length} passages for topic: ${topicDataArray[0].title}`);
    } catch (error) {
      console.error('❌ Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user settings to get English level
  const loadUserSettings = async () => {
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
    }
  };

  // Load user progress to get completed passages
  const loadUserProgress = async () => {
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
  };

  useEffect(() => {
    loadUserSettings();
    loadUserProgress();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTopic();
    }
  }, [user, userEnglishLevel, topicSlug]);

  // Refresh progress when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadUserProgress();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'review') {
      navigate('/review');
    }
  };

  const getTopicIcon = (slug: string | undefined) => {
    switch (slug) {
      case 'nature': return '🌿';
      case 'travel': return '✈️';
      case 'daily-activities': return '🏠';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Header onTabChange={handleTabChange} activeTab={activeTab} />
        <div className="main-content">
          <div className="topics-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải bài học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="app">
        <Header onTabChange={handleTabChange} activeTab={activeTab} />
        <div className="main-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2 style={{ color: 'white' }}>❌ Không tìm thấy chủ đề</h2>
            <button 
              className="button" 
              onClick={() => navigate('/')}
              style={{ marginTop: '20px' }}
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      <div className="main-content">
        <div className="container">

          {/* Passages Grid */}
          {passages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>
                📝 Chưa có bài học nào
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Vui lòng liên hệ admin để thêm bài học cho chủ đề này
              </p>
            </div>
          ) : (
            <div className="lessons-grid">
              {passages.map((passage: Passage) => (
                <LessonCard
                  key={passage.id}
                  passage={passage}
                  isLearned={completedPassages.has(passage.id)}
                  onClick={() => navigate(`/passage/${passage.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;
