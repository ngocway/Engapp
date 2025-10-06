import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../firebase/topicService';
import { passageService } from '../firebase/passageService';
import { Topic, Passage } from '../types';

const TopicsSection: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [passagesByTopic, setPassagesByTopic] = useState<Record<string, Passage[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopicsAndPassages();
  }, []);

  const loadTopicsAndPassages = async () => {
    try {
      setLoading(true);
      
      // Load topics
      const topicsData = await topicService.getAll();
      setTopics(topicsData);

      // Load passages for each topic
      const passagesMap: Record<string, Passage[]> = {};
      for (const topic of topicsData) {
        if (topic.slug) {
          const passages = await passageService.getByTopicSlug(topic.slug);
          passagesMap[topic.slug] = passages.slice(0, 4); // Chỉ lấy 4 passages đầu tiên
        }
      }
      setPassagesByTopic(passagesMap);
    } catch (error) {
      console.error('Error loading topics and passages:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="topics-section">
      {topics.map((topic) => {
        const topicPassages = topic.slug ? passagesByTopic[topic.slug] || [] : [];
        
        // Chỉ hiển thị topic nếu có ít nhất 1 passage
        if (topicPassages.length === 0) {
          return null;
        }

        return (
          <div key={topic.id} className="topic-group">
            <div className="topic-header">
              <div className="topic-title">
                <span className="topic-icon">{getTopicIcon(topic.slug)}</span>
                <h2>{topic.name}</h2>
                <span className="lesson-count">({topicPassages.length} bài học)</span>
              </div>
              <button 
                className="view-all-button"
                onClick={() => topic.slug && navigate(`/topics/${topic.slug}`)}
              >
                Xem tất cả →
              </button>
            </div>

            <div className="passages-grid">
              {topicPassages.map((passage: Passage) => (
                <div 
                  key={passage.id} 
                  className="passage-card-parroto"
                  onClick={() => navigate(`/passage/${passage.id}`)}
                >
                  <div className="passage-thumbnail">
                    {passage.thumbnail ? (
                      <img src={passage.thumbnail} alt={passage.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        {getTopicIcon(topic.slug)}
                      </div>
                    )}
                  </div>
                  
                  <div className="passage-info">
                    <div className="passage-meta">
                      <span className="view-count">{Math.floor(Math.random() * 10000) + 1000}</span>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(passage.level || 1) }}
                      >
                        {getDifficultyText(passage.level || 1)}
                      </span>
                      <span className="source">Youtube</span>
                      <span className="duration">•{Math.floor(Math.random() * 3) + 1}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')} phút</span>
                    </div>
                    
                    <h3 className="passage-title">{passage.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopicsSection;
