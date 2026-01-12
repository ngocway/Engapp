import React, { useState, useEffect } from 'react';
import { PassageVocab } from '../types';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';

interface VocabFlashcardProps {
  term: string;
  definition?: string;
  example?: string;
  audio?: string;
  image?: string;
  difficulty?: VocabDifficulty;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  position?: { x: number; y: number };
  passageVocab?: any[];
  isPracticeMode?: boolean;
  onPracticeEnd?: () => Promise<void>;
}

export const VocabFlashcard: React.FC<VocabFlashcardProps> = ({
  term,
  definition,
  example,
  audio,
  image,
  difficulty = 'easy',
  onNext,
  onPrevious,
  onComplete,
  onClose
}) => {
  // Make useAuth optional to prevent errors when not wrapped in AuthProvider
  let user: any = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    console.log('Auth context not available, continuing without user');
  }
  const [showDefinition, setShowDefinition] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  const handleFlip = () => {
    setShowDefinition(!showDefinition);
  };

  const handleLearned = async () => {
    if (user) {
      try {
        // await userVocabService.addUserVocab(user.uid, {
        //   term,
        //   definition,
        //   example,
        //   audio,
        //   image,
        //   difficulty,
        //   learned: true,
        //   learnedAt: new Date()
        // });
        setIsLearned(true);
      } catch (error) {
        console.error('Error saving learned vocab:', error);
      }
    }
  };

  const playAudio = () => {
    if (audio) {
      const audioElement = new Audio(audio);
      audioElement.play().catch(console.error);
    }
  };

  return (
    <div className="vocab-flashcard">
      <div className="flashcard-header">
        <span className="difficulty-badge">{difficulty}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {audio && (
            <button onClick={playAudio} className="audio-button">
              🔊
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="audio-button" style={{ fontSize: '18px' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flashcard-content" onClick={handleFlip}>
        {image && (
          <div className="flashcard-image">
            <img src={image} alt={term} />
          </div>
        )}

        <div className="flashcard-text">
          {!showDefinition ? (
            <div className="term">
              <h2>{term}</h2>
            </div>
          ) : (
            <div className="definition">
              <p><strong>Definition:</strong> {definition}</p>
              {example && (
                <p><strong>Example:</strong> {example}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flashcard-actions">
        <button onClick={onPrevious} className="prev-button">
          ← Previous
        </button>
        
        <button onClick={handleLearned} className="learned-button" disabled={isLearned}>
          {isLearned ? '✓ Learned' : 'Mark as Learned'}
        </button>
        
        <button onClick={onNext} className="next-button">
          Next →
        </button>
      </div>
    </div>
  );
};