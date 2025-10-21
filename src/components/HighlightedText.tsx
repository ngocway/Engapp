import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlightedWords?: string[];
  onWordClick?: (word: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onVocabularyClick?: (word: string, event?: React.MouseEvent) => void;
  passageVocab?: any[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ 
  text, 
  highlightedWords, 
  onWordClick 
}) => {
  const safeHighlightedWords: string[] = highlightedWords ?? [];
  const handleWordClick = onWordClick ?? (() => {});

  const highlightText = (text: string, words: string[]) => {
    if (!words || words.length === 0) return text;
    
    let highlightedText = text;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `**${word}**`);
    });
    
    return highlightedText;
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const word = part.slice(2, -2);
        return (
          <button
            key={index}
            className="highlighted-word clickable-vocab"
            onClick={(e) => handleWordClick(word, e)}
          >
            {word}
          </button>
        );
      }
      return part;
    });
  };

  const highlightedText = highlightText(text, safeHighlightedWords);

  return (
    <div className="highlighted-text">
      {renderHighlightedText(highlightedText)}
    </div>
  );
};

export default HighlightedText;