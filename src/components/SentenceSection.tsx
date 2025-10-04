import React, { useState, useEffect } from 'react';
import { Sentence } from '../types';
import SentenceExercise from './SentenceExercise';
import { progressService } from '../firebase/progressService';
import { useAuth } from '../contexts/AuthContext';

interface SentenceSectionProps {
  onBack: () => void;
}

const SentenceSection: React.FC<SentenceSectionProps> = ({ onBack }) => {
  // Dữ liệu câu mẫu (trong thực tế sẽ load từ Firebase)
  const [sentences] = useState<Sentence[]>([
    {
      id: '1',
      sentence: 'I like cats',
      words: ['I', 'like', 'cats'],
      correctOrder: [0, 1, 2],
      translation: 'Tôi thích mèo'
    },
    {
      id: '2',
      sentence: 'The dog is big',
      words: ['The', 'dog', 'is', 'big'],
      correctOrder: [0, 1, 2, 3],
      translation: 'Con chó rất to'
    },
    {
      id: '3',
      sentence: 'I eat an apple',
      words: ['I', 'eat', 'an', 'apple'],
      correctOrder: [0, 1, 2, 3],
      translation: 'Tôi ăn một quả táo'
    }
  ]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const currentSentence = sentences[currentSentenceIndex];

  // Load tiến độ từ Firebase
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const userId = 'demo-user'; // Trong thực tế sẽ lấy từ auth
        const progress = await progressService.getUserProgress(userId);
        if (progress) {
          setCompletedSentences(progress.completedSentences);
          setScore(progress.score);
        }
      } catch (error) {
        console.error('Lỗi khi load tiến độ:', error);
      }
    };

    loadProgress();
  }, []);

  const handleComplete = async (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 10);
      if (!completedSentences.includes(currentSentence.id)) {
        setCompletedSentences(prev => [...prev, currentSentence.id]);
        
        // Lưu tiến độ vào Firebase
        const userId = 'demo-user'; // Trong thực tế sẽ lấy từ auth
        await progressService.addCompletedSentence(userId, currentSentence.id);
      }
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  };

  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const resetProgress = () => {
    setCurrentSentenceIndex(0);
    setCompletedSentences([]);
    setScore(0);
  };

  const progress = ((currentSentenceIndex + 1) / sentences.length) * 100;

  return (
    <div className="main-content">

      <div className="sentence-section">
        <h2 className="section-title">📝 Học Đặt Câu</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="progress-bar" style={{ margin: '10px auto', maxWidth: '400px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p style={{ color: '#666' }}>
            Câu {currentSentenceIndex + 1}/{sentences.length} • Điểm: {score}
          </p>
        </div>

        {currentSentence && (
          <SentenceExercise
            sentence={currentSentence}
            onComplete={handleComplete}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="button" 
            onClick={prevSentence}
            disabled={currentSentenceIndex === 0}
            style={{ marginRight: '10px' }}
          >
            ← Trước
          </button>
          
          <button 
            className="button" 
            onClick={nextSentence}
            disabled={currentSentenceIndex === sentences.length - 1}
            style={{ marginRight: '10px' }}
          >
            Sau →
          </button>

          <button className="button" onClick={resetProgress}>
            🔄 Làm lại
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            💡 Kéo thả các từ để tạo câu đúng!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SentenceSection;
