import React from 'react';
import { Vocabulary } from '../types';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  onPlayAudio: (word: string) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ vocabulary, onPlayAudio }) => {
  return (
    <div className="vocabulary-card" onClick={() => onPlayAudio(vocabulary.word)}>
      <img src={vocabulary.image} alt={vocabulary.word} />
      <h3>{vocabulary.word}</h3>
      <p>{vocabulary.meaning}</p>
      <div className="pronunciation">{vocabulary.pronunciation}</div>
    </div>
  );
};

export default VocabularyCard;




















