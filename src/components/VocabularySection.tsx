import React, { useState, useEffect } from 'react';
import { Vocabulary } from '../types';
import VocabularyCard from './VocabularyCard';
import { vocabularyService } from '../firebase/vocabularyService';
import { progressService } from '../firebase/progressService';
import { useAuth } from '../contexts/AuthContext';

interface VocabularySectionProps {
  onBack: () => void;
}

const VocabularySection: React.FC<VocabularySectionProps> = ({ onBack }) => {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const { user } = useAuth();

  // Load dữ liệu từ Firebase khi component mount
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setLoading(true);
        const data = await vocabularyService.getAllVocabulary();
        
        // Chỉ sử dụng dữ liệu từ Firebase
        setVocabulary(data);
        
        // Load tiến độ học tập
        if (user) {
          const progress = await progressService.getUserProgress(user.uid);
          if (progress) {
            setLearnedWords(progress.learnedWords || []);
          }
        }
      } catch (error) {
        console.error('Lỗi khi load dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, []);

  const playAudio = async (vocabulary: Vocabulary) => {
    // Ưu tiên phát audio thực tế từ Firebase Storage
    if (vocabulary.audioUrl && (vocabulary.audioUrl.startsWith('data:audio/') || vocabulary.audioUrl.startsWith('http'))) {
      try {
        const audio = new Audio(vocabulary.audioUrl);
        await audio.play();
      } catch (error) {
        console.error('Lỗi khi phát audio:', error);
        // Fallback về text-to-speech nếu audio không phát được
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(vocabulary.word);
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
    } else {
      // Fallback về text-to-speech nếu không có audio
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(vocabulary.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    }

    // Đánh dấu từ đã học và lưu vào Firebase
    if (!learnedWords.includes(vocabulary.id)) {
      setLearnedWords(prev => [...prev, vocabulary.id]);
      
      // Lưu tiến độ vào Firebase
      if (user) {
        await progressService.addLearnedWord(user.uid, vocabulary.id);
      }
    }
  };

  const progress = (learnedWords.length / vocabulary.length) * 100;

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: 'white' }}>🔄 Đang tải dữ liệu...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">

      <div className="vocabulary-section">
        <h2 className="section-title">🎓 Học Từ Vựng</h2>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p style={{ textAlign: 'center', marginBottom: '30px' }}>
          Đã học: {learnedWords.length}/{vocabulary.length} từ
        </p>

        <div className="vocabulary-grid">
          {vocabulary.map((word) => (
            <VocabularyCard
              key={word.id}
              vocabulary={word}
              onPlayAudio={() => playAudio(word)}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            💡 Nhấn vào từ để nghe phát âm!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VocabularySection;
