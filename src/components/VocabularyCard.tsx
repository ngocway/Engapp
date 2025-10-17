import React from 'react';
import { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onPlayAudio: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ vocabulary, onPlayAudio }) => {
  return (
    <div className="vocabulary-card" onClick={onPlayAudio}>
      <img src={vocabulary.image} alt={vocabulary.word} />
      <div className="word-info">
        <h3>{vocabulary.word}</h3>
        {vocabulary.pronunciation && (
          <div className="pronunciation">/ {vocabulary.pronunciation} /</div>
        )}
        {vocabulary.partOfSpeech && (
          <div className="part-of-speech">{vocabulary.partOfSpeech}</div>
        )}
      </div>
      <p>{vocabulary.meaning}</p>
    </div>
  );
};

export default VocabularyCard;





























