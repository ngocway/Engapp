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
  onWordClick,
  passageVocab
}) => {
  const safeHighlightedWords: string[] = highlightedWords ?? [];
  const handleWordClick = onWordClick ?? (() => { });

  const highlightText = (text: string, words: string[]) => {
    if (!words || words.length === 0) {
      // Remove all square brackets from text if no words to highlight
      return text.replace(/\[([^\]]+)\]/g, '$1');
    }

    let highlightedText = text;

    // First, remove square brackets from the text
    highlightedText = highlightedText.replace(/\[([^\]]+)\]/g, '$1');

    // Then highlight the words
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
        // Find definition if available
        let definition = '';
        if (passageVocab) {
          const vocabItem = passageVocab.find(v => v.term === word);
          if (vocabItem) {
            definition = `${vocabItem.term}: ${vocabItem.definition || vocabItem.meaning || ''}`;
          }
        }

        return (
          <button
            key={index}
            className="bg-accent-yellow dark:bg-accent-yellow-dark border-b-2 border-yellow-400 dark:border-yellow-600 cursor-help px-1 py-0.5 rounded inline-block transition-all duration-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 text-slate-900 dark:text-slate-100 font-medium"
            onClick={(e) => handleWordClick(word, e)}
            title={definition}
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