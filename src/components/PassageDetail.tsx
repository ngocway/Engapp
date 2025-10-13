import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Passage, Question } from '../types';
import { topicService } from '../firebase/topicService';
import { questionService } from '../firebase/questionService';
import HighlightedText from './HighlightedText';
import QuizSection from './QuizSection';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

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

  // Hàm xử lý khi click vào từ vựng được highlight
  const handleVocabularyClick = (word: string) => {
    // Phát âm từ vựng
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  // Load questions when transcript tab is active
  useEffect(() => {
    if (activeTab === 'transcript') {
      const loadQuestions = async () => {
        try {
          setLoadingQuestions(true);
          const passageQuestions = await questionService.getByPassageId(passage.id);
          setQuestions(passageQuestions);
        } catch (error) {
          console.error('Error loading questions:', error);
        } finally {
          setLoadingQuestions(false);
        }
      };
      loadQuestions();
    }
  }, [activeTab, passage.id]);


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
                // Use passage.vocab if available, otherwise fallback to extracting from text
                if (passage.vocab && passage.vocab.length > 0) {
                  return passage.vocab.map((vocab, index) => (
                    <div key={index} className="vocabulary-item">
                      <div className="vocab-word">{vocab.term}</div>
                      {vocab.meaning && (
                        <div className="vocab-meaning">{vocab.meaning}</div>
                      )}
                      {vocab.phonetics?.us && (
                        <div className="vocab-pronunciation">{vocab.phonetics.us}</div>
                      )}
                    </div>
                  ));
                } else {
                  // Fallback: Extract vocabulary from text (same logic as HighlightedText)
                  const bracketRegex = /\[([^\]]+)\]/g;
                  const matches = passage.text.match(bracketRegex);
                  
                  if (matches && matches.length > 0) {
                    const vocabularyWords = matches.map(match => {
                      const word = match.slice(1, -1).trim(); // Remove brackets
                      return word;
                    }).filter(word => word.length > 0);
                    
                    // Remove duplicates
                    const uniqueWords = Array.from(new Set(vocabularyWords));
                    
                    return uniqueWords.map((word, index) => (
                      <div key={index} className="vocabulary-item">
                        <div className="vocab-word">{word}</div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="no-vocabulary">
                        <p>Không có từ vựng nào được định nghĩa trong bài học này.</p>
                        <p><small>💡 Để thêm từ vựng, sử dụng chức năng "Quản lý từ vựng" trong admin</small></p>
                      </div>
                    );
                  }
                }
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

          {activeTab === 'dictation' ? (
            <div className="lesson-content">
              <h3>Nội dung bài học</h3>
              <div className="content-text">
                <HighlightedText 
                  text={passage.text} 
                  onVocabularyClick={handleVocabularyClick}
                  passageVocab={passage.vocab || []}
                />
              </div>
            </div>
          ) : (
            <>
              {loadingQuestions ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#666', fontSize: '1.2rem' }}>
                    🔄 Đang tải câu hỏi...
                  </p>
                </div>
              ) : (
                <QuizSection questions={questions} passageId={passage.id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassageDetail;