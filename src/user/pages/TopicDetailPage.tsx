import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../../firebase/topicService';
import { passageService } from '../../firebase/passageService';
import { userSettingsService } from '../../firebase/userSettingsService';
import { progressService } from '../../firebase/progressService';
import { Topic, Passage, EnglishLevel } from '../../types';
import { useAuth } from '../contexts/AuthContext';
import LessonCard from '../components/LessonCard';
import Header from '../components/Header';
import SearchAndFilter, { DifficultyFilter } from '../../components/SearchAndFilter';
import LoginRequiredModal from '../components/LoginRequiredModal';

type TabType = 'topics' | 'review';

const TopicDetailPage: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  // User page doesn't need admin context
  const [topic, setTopic] = useState<Topic | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('topics');
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Filter passages based on search term and difficulty
  const filterPassages = (passages: Passage[]): Passage[] => {
    let filtered = [...passages];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(passage => 
        passage.title.toLowerCase().includes(searchLower) ||
        passage.excerpt?.toLowerCase().includes(searchLower) ||
        passage.vocab?.some(word => 
          word.term?.toLowerCase().includes(searchLower) ||
          word.meaning?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(passage => {
        // Map difficulty filter to English levels
        const difficultyMap: Record<DifficultyFilter, EnglishLevel[]> = {
          'all': [],
          'easy': ['kids-2-4', 'kids-5-10', 'basic'],
          'normal': ['basic', 'independent'],
          'hard': ['independent', 'proficient']
        };

        const targetLevels = difficultyMap[difficultyFilter];
        if (targetLevels.length === 0) return true;

        // Check if passage matches any of the target levels
        if (passage.englishLevels && passage.englishLevels.length > 0) {
          return passage.englishLevels.some(level => targetLevels.includes(level));
        }

        if (passage.englishLevel) {
          return targetLevels.includes(passage.englishLevel);
        }

        // Fallback to old level system
        const levelMapping: Record<number, EnglishLevel> = {
          1: 'basic',
          2: 'independent', 
          3: 'independent',
          4: 'proficient'
        };
        const mappedLevel = levelMapping[passage.level] || 'basic';
        return targetLevels.includes(mappedLevel);
      });
    }

    return filtered;
  };

  // Filter passages based on user's English level
  const filterPassagesByLevel = (passages: Passage[]): Passage[] => {
    // Admin sees all passages without filtering
    // User page doesn't need admin context
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
      // Store all passages first, then apply filters in the render
      setPassages(allPassages);
      
      console.log(`📚 Loaded ${allPassages.length} passages for topic: ${topicDataArray[0].title}`);
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
    } else {
      // Set default level for non-logged in users
      setUserEnglishLevel('basic');
      console.log('📚 Non-logged user, using default level: basic');
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
    loadTopic();
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
      // Kiểm tra login khi chuyển sang tab review
      if (!user) {
        setShowLoginModal(true);
        return;
      }
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

  // Sort passages: 4 free lessons first, then random order
  const sortPassages = (passages: Passage[]): Passage[] => {
    // Separate free and premium passages
    const freePassages = passages.filter(passage => passage.accessType === 'free' || !passage.accessType);
    const premiumPassages = passages.filter(passage => passage.accessType === 'premium');
    
    // Take first 4 free passages
    const firstFourFree = freePassages.slice(0, 4);
    
    // Randomize remaining free passages
    const remainingFree = freePassages.slice(4).sort(() => Math.random() - 0.5);
    
    // Randomize premium passages
    const randomizedPremium = premiumPassages.sort(() => Math.random() - 0.5);
    
    // Combine: first 4 free + remaining free + premium
    return [...firstFourFree, ...remainingFree, ...randomizedPremium];
  };

  // Apply all filters to passages
  const levelFilteredPassages = filterPassagesByLevel(passages);
  const finalFilteredPassages = filterPassages(levelFilteredPassages);
  const sortedPassages = sortPassages(finalFilteredPassages);

  const handleLoginClick = () => {
    setShowLoginModal(false);
    // Show login form using AuthContext
    login();
  };

  return (
    <div className="app">
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      <div className="main-content">
        <div className="container">
          {/* Search and Filter */}
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={setDifficultyFilter}
          />

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
          ) : sortedPassages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>
                🔍 Không tìm thấy bài học nào
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc độ khó
              </p>
            </div>
          ) : (
            <div className="lessons-grid">
              {sortedPassages.map((passage: Passage) => (
                <LessonCard
                  key={passage.id}
                  passage={passage}
                  isLearned={completedPassages.has(passage.id)}
                  isLoggedIn={!!user}
                  onClick={() => {
                    // Check if user is not logged in and trying to access premium content
                    if (!user && passage.accessType === 'premium') {
                      setShowLoginModal(true);
                      return;
                    }
                    
                    navigate(`/passage/${passage.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
        title="🔒 Chức năng Premium"
        description="Chức năng Ôn tập chỉ dành cho thành viên, vui lòng đăng nhập để có thể lưu tiến trình học tập của bạn."
        loginButtonIcon="🔑"
        loginButtonText="Đăng nhập"
      />
    </div>
  );
};

export default TopicDetailPage;
