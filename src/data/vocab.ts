import { VocabDoc } from '../firebase/vocabService';

export const vocabSeeds: VocabDoc[] = [
  {
    term: 'car',
    partOfSpeech: 'noun [ C ]',
    definitionEn: 'A road vehicle with an engine, four wheels, and seats for a small number of people.',
    translationVi: 'xe ô tô',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    phonetics: { uk: '/kɑː/', us: '/kɑr/' },
    examples: [
      "They don't have a car.",
      'Where did you park your car?',
      "It's quicker by car.",
      'a car chase/accident/factory'
    ],
    topicSlug: 'travel',
    tags: ['vehicle', 'transport'],
    level: 1,
    source: 'Unsplash, definition simplified',
    createdAt: Date.now()
  },
  {
    term: 'mist',
    partOfSpeech: 'noun [ U ]',
    definitionEn: 'Very light fog near the ground or water.',
    translationVi: 'sương mù nhẹ',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    phonetics: { uk: '/mɪst/', us: '/mɪst/' },
    examples: ['Mist covered the lake.', 'The mist felt cool.'],
    topicSlug: 'nature',
    tags: ['weather', 'nature'],
    level: 1,
    createdAt: Date.now()
  }
];


































