import React from 'react';
import { Passage } from '../types';

interface PassageDetailProps {
  passage: Passage;
  onBack: () => void;
}

const PassageDetail: React.FC<PassageDetailProps> = ({ passage, onBack }) => {
  return (
    <div>
      <h2>Passage Detail</h2>
      <p>Title: {passage.title}</p>
      <p>Text: {passage.text}</p>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default PassageDetail;