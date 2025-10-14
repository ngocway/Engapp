export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  vietnamesePronunciation?: string; // Phiên âm đọc cho người Việt
  audioUrl?: string;
  imageUrl?: string;
  image?: string; // for backward compatibility
  example?: string; // for backward compatibility
  examples?: string[]; // new field for multiple examples
  partOfSpeech?: string; // e.g., "noun", "verb"
  definitionEn?: string; // English definition
  category?: string;
  level?: number;
  learned?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  name?: string; // for backward compatibility
  description: string;
  imageUrl?: string;
  thumbnail?: string; // for backward compatibility
  slug?: string; // for backward compatibility
  level: number;
  passages?: Passage[];
}

export interface Passage {
  id: string;
  title: string;
  text: string;
  translation?: string;
  excerpt?: string; // short description
  thumbnail?: string; // image thumbnail
  audioUrl?: string; // audio file URL
  level: number; // for backward compatibility
  englishLevel?: EnglishLevel; // new field for English proficiency level (backward compatibility)
  englishLevels?: EnglishLevel[]; // array of English proficiency levels
  topicId: string;
  topicSlug?: string; // for backward compatibility
  createdAt?: number;
  vocab?: PassageVocab[]; // highlighted vocabulary within the text
  questions?: Question[]; // quiz questions for this passage
}

export interface Question {
  id: string;
  passageId: string;
  type: 'multiple_choice' | 'fill_blank' | 'true_false';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number | boolean; // answer, option index, or true/false
  explanation?: string;
  points: number;
  vocabFocus?: string[]; // related vocabulary terms
  createdAt?: number; // timestamp when question was created
}

export interface PassageVocab {
  term: string; // e.g., "boarding pass"
  meaning: string; // e.g., "thẻ lên máy bay"
  image?: string; // thumbnail for vocab
  audio?: string; // pronunciation audio
  pronunciation?: string; // phonetic pronunciation
  partOfSpeech?: string; // e.g., "noun", "verb"
  phonetics?: {
    us?: string; // US pronunciation
    uk?: string; // UK pronunciation
  };
  definitionEn?: string; // English definition
  explanationEn?: string; // English explanation
  example?: string; // single example sentence
  examples?: string[]; // example sentences
}

export interface Sentence {
  id: string;
  sentence: string;
  words: string[];
  correctOrder: number[];
  translation: string;
}

export interface UserProgress {
  userId: string;
  completedSentences: string[];
  completedPassages?: string[]; // passages that user has completed all questions
  learnedWords?: string[]; // for backward compatibility
  score: number;
  level: number;
}

export type GameMode = 'vocabulary' | 'sentence' | 'main' | 'topicSelect' | 'passageList';

export type EnglishLevel = 'kids-2-4' | 'kids-5-10' | 'basic' | 'independent' | 'proficient';