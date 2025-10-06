import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage } from '../types';
import { topicService } from '../firebase/topicService';

interface PassageDetailProps {
  passage: Passage;
  onBack: () => void;
}

const PassageDetail: React.FC<PassageDetailProps> = ({ passage, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dictation' | 'transcript'>('dictation');
  const [userInput, setUserInput] = useState('');
  const [showAllWords, setShowAllWords] = useState(false);
  const [topicName, setTopicName] = useState<string>('');

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return '#10b981'; // Green for A1
      case 2: return '#3b82f6'; // Blue for A2
      case 3: return '#f59e0b'; // Orange for B1
      case 4: return '#ef4444'; // Red for B2
      default: return '#64748b'; // Gray
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'A1';
      case 2: return 'A2';
      case 3: return 'B1';
      case 4: return 'B2';
      default: return 'N/A';
    }
  };

  // Load topic name
  useEffect(() => {
    const loadTopicName = async () => {
      console.log('Loading topic name for passage:', passage);
      console.log('Passage topicId:', passage.topicId);
      
      try {
        const topics = await topicService.getAll();
        console.log('All topics:', topics);
        
        let topic = null;
        
        // Try to find by topicId first
        if (passage.topicId) {
          topic = topics.find(t => t.id === passage.topicId);
          console.log('Found topic by ID:', topic);
        }
        
        // Fallback: try to find by slug if not found by ID
        if (!topic && passage.topicSlug) {
          topic = topics.find(t => t.slug === passage.topicSlug);
          console.log('Found topic by slug:', topic);
        }
        
        // If still no topic found, try to infer from passage title or use default
        if (!topic) {
          // Try to match by common patterns in passage titles
          const passageTitle = passage.title.toLowerCase();
          if (passageTitle.includes('nature') || passageTitle.includes('tree') || passageTitle.includes('star')) {
            topic = topics.find(t => t.slug === 'nature' || t.name?.toLowerCase().includes('nature'));
          } else if (passageTitle.includes('travel') || passageTitle.includes('river') || passageTitle.includes('park')) {
            topic = topics.find(t => t.slug === 'travel' || t.name?.toLowerCase().includes('travel'));
          } else if (passageTitle.includes('daily') || passageTitle.includes('activity')) {
            topic = topics.find(t => t.slug === 'daily-activities' || t.name?.toLowerCase().includes('daily'));
          }
          console.log('Found topic by inference:', topic);
        }
        
        if (topic && (topic.name || topic.title)) {
          const topicName = topic.name || topic.title;
          console.log('Setting topic name:', topicName);
          setTopicName(topicName);
        } else {
          console.log('Topic not found, using fallback');
          setTopicName('Chủ đề');
        }
      } catch (error) {
        console.error('Error loading topic:', error);
        setTopicName('Chủ đề');
      }
    };
    loadTopicName();
  }, [passage.topicId]);

  // Mock words for dictation exercise
  const words = passage.text.split(' ').slice(0, 10);
  const maskedWords = words.map(word => '*'.repeat(word.length));

  return (
    <div className="passage-detail-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate('/topics')}>{topicName || 'Chủ đề'}</span>
        <span>›</span>
        <span>{passage.title}</span>
      </div>

      <div className="passage-detail-layout">
        {/* Left Panel - Video */}
        <div className="left-panel">
          <h3 className="panel-title">{passage.title}</h3>
          
          <div className="video-container">
            <div className="video-player">
              {passage.thumbnail ? (
                <img src={passage.thumbnail} alt={passage.title} className="video-thumbnail" />
              ) : (
                <div className="video-placeholder">
                  <div className="play-button">▶</div>
                </div>
              )}
              <div className="video-overlay">
                <div className="video-title">{passage.title}</div>
                <div className="video-source">Xem trên YouTube</div>
              </div>
            </div>
          </div>

          <div className="vocabulary-section">
            <h4>Từ mới</h4>
            <div className="vocabulary-list">
              {(() => {
                // Mock vocabulary data for demonstration
                const mockVocabulary = [
                  { term: "star", meaning: "ngôi sao", pronunciation: "stɑːr" },
                  { term: "tonight", meaning: "tối nay", pronunciation: "təˈnaɪt" },
                  { term: "coffee", meaning: "cà phê", pronunciation: "ˈkɔːfi" },
                  { term: "wood", meaning: "gỗ", pronunciation: "wʊd" },
                  { term: "control", meaning: "kiểm soát", pronunciation: "kənˈtroʊl" }
                ];

                return mockVocabulary.map((vocab, index) => (
                  <div key={index} className="vocabulary-item">
                    <div className="vocab-word">{vocab.term}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Right Panel - Exercise */}
        <div className="right-panel">
          <div className="exercise-tabs">
            <div className="package-tab-wrapper">
              <input 
                type="radio" 
                id="tab-1" 
                name="tab" 
                className="input"
                checked={activeTab === 'dictation'}
                onChange={() => setActiveTab('dictation')}
              />
              <label htmlFor="tab-1" className="package-tab">
                Đọc bài
              </label>
              
              <input 
                type="radio" 
                id="tab-2" 
                name="tab" 
                className="input"
                checked={activeTab === 'transcript'}
                onChange={() => setActiveTab('transcript')}
              />
              <label htmlFor="tab-2" className="package-tab">
                Câu hỏi
              </label>
            </div>
          </div>

          <div className="lesson-content">
            <h3>Nội dung bài học</h3>
            <div className="content-text">
              {passage.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassageDetail;