import React, { useState } from 'react';
import { Sentence } from '../types';

interface SentenceExerciseProps {
  sentence: Sentence;
  onComplete: (correct: boolean) => void;
}

const SentenceExercise: React.FC<SentenceExerciseProps> = ({ sentence, onComplete }) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([...sentence.words]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleWordSelect = (word: string) => {
    if (isCompleted) return;

    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter(w => w !== word));
  };

  const handleWordRemove = (word: string, index: number) => {
    if (isCompleted) return;

    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswer = () => {
    const isCorrect = selectedWords.join(' ') === sentence.sentence;
    setIsCompleted(true);
    setShowResult(true);
    onComplete(isCorrect);
  };

  const resetExercise = () => {
    setSelectedWords([]);
    setAvailableWords([...sentence.words]);
    setIsCompleted(false);
    setShowResult(false);
  };

  return (
    <div className="sentence-exercise">
      <h4>Đặt câu đúng: "{sentence.translation}"</h4>
      
      <div className="sentence-result">
        {selectedWords.length === 0 ? 'Chọn các từ để tạo câu...' : selectedWords.join(' ')}
      </div>

      <div className="word-options">
        {availableWords.map((word, index) => (
          <button
            key={`available-${index}`}
            className="word-option"
            onClick={() => handleWordSelect(word)}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="word-options">
        {selectedWords.map((word, index) => (
          <button
            key={`selected-${index}`}
            className="word-option selected"
            onClick={() => handleWordRemove(word, index)}
          >
            {word}
          </button>
        ))}
      </div>

      {showResult && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ 
            color: selectedWords.join(' ') === sentence.sentence ? '#00B894' : '#E17055',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            {selectedWords.join(' ') === sentence.sentence ? '🎉 Đúng rồi!' : '😔 Chưa đúng'}
          </p>
          <p style={{ marginTop: '10px', color: '#636E72' }}>
            Câu đúng: <strong>{sentence.sentence}</strong>
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {!isCompleted ? (
          <button 
            className="button" 
            onClick={checkAnswer}
            disabled={selectedWords.length !== sentence.words.length}
          >
            Kiểm tra
          </button>
        ) : (
          <button className="button" onClick={resetExercise}>
            Làm lại
          </button>
        )}
      </div>
    </div>
  );
};

export default SentenceExercise;




















