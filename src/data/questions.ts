import { Question } from '../types';

// Sample questions for the long passages
export const questionSeeds: Omit<Question, 'id'>[] = [
  // Questions for "First Time Flying Alone" (passage ID will be set when uploaded)
  {
    passageId: 'temp-travel-1', // Will be replaced with actual passage ID
    type: 'multiple_choice',
    question: 'What did Minh need to show at the airline counter?',
    options: ['His passport', 'His ID and boarding pass', 'His ticket', 'His luggage'],
    correctAnswer: 1,
    explanation: 'Minh showed his ID and the agent printed a boarding pass for him.',
    points: 10,
    vocabFocus: ['boarding pass', 'ID', 'airline counter']
  },
  {
    passageId: 'temp-travel-1',
    type: 'fill_blank',
    question: 'Minh put his phone and keys into a plastic tray and placed his backpack on the conveyor belt of the _____ machine.',
    correctAnswer: 'X-ray',
    explanation: 'The X-ray machine scans bags for security.',
    points: 10,
    vocabFocus: ['X-ray machine', 'security', 'conveyor belt']
  },
  {
    passageId: 'temp-travel-1',
    type: 'true_false',
    question: 'Minh felt nervous when going through security.',
    correctAnswer: 'true',
    explanation: 'The text says "Minh felt a little nervous, but the officer gave him a reassuring nod."',
    points: 5,
    vocabFocus: ['nervous', 'security', 'reassuring']
  },
  {
    passageId: 'temp-travel-1',
    type: 'multiple_choice',
    question: 'What did Minh see when the plane took off?',
    options: ['The city grew smaller below', 'The clouds looked like mountains', 'Both A and B', 'Nothing special'],
    correctAnswer: 2,
    explanation: 'Minh saw both the city growing smaller and clouds that looked like mountains of cotton.',
    points: 10,
    vocabFocus: ['took off', 'clouds', 'city']
  },

  // Questions for "A Productive School Day"
  {
    passageId: 'temp-daily-1',
    type: 'multiple_choice',
    question: 'What time does Linh wake up on weekdays?',
    options: ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM'],
    correctAnswer: 1,
    explanation: 'Linh wakes up at half past six (6:30 AM).',
    points: 5,
    vocabFocus: ['weekdays', 'wake up', 'half past six']
  },
  {
    passageId: 'temp-daily-1',
    type: 'fill_blank',
    question: 'Linh checks her _____ and packs her backpack before leaving for school.',
    correctAnswer: 'timetable',
    explanation: 'A timetable shows your class schedule.',
    points: 10,
    vocabFocus: ['timetable', 'backpack', 'schedule']
  },
  {
    passageId: 'temp-daily-1',
    type: 'true_false',
    question: 'Linh conducts a science experiment with magnets.',
    correctAnswer: 'true',
    explanation: 'The text mentions "Linh and her partner conduct a simple experiment with magnets."',
    points: 5,
    vocabFocus: ['experiment', 'magnets', 'science']
  },
  {
    passageId: 'temp-daily-1',
    type: 'multiple_choice',
    question: 'What does Linh write in her journal before bed?',
    options: ['Only what she learned', 'Only what she enjoyed', 'Three things: learned, enjoyed, and wants to improve', 'Nothing'],
    correctAnswer: 2,
    explanation: 'Linh writes three lines about something she learned, enjoyed, and wants to improve.',
    points: 10,
    vocabFocus: ['journal', 'learned', 'improve']
  },

  // Questions for "Morning by the Lake"
  {
    passageId: 'temp-nature-1',
    type: 'multiple_choice',
    question: 'What color was the lake at sunrise?',
    options: ['Blue', 'Silver', 'Gold', 'Green'],
    correctAnswer: 1,
    explanation: 'The lake held a quiet silver color at sunrise.',
    points: 5,
    vocabFocus: ['silver', 'sunrise', 'lake']
  },
  {
    passageId: 'temp-nature-1',
    type: 'multiple_choice',
    question: 'What is "mist" in the passage?',
    options: ['Heavy rain', 'Very light fog near the ground or water', 'Strong wind', 'Bright sunlight'],
    correctAnswer: 1,
    explanation: 'Mist is very light fog that appears near the ground or water, making the scene look dreamy.',
    points: 10,
    vocabFocus: ['mist', 'fog', 'light']
  },
  {
    passageId: 'temp-nature-1',
    type: 'fill_blank',
    question: 'A light _____ floats above the surface of the lake.',
    correctAnswer: 'mist',
    explanation: 'Mist is the light fog that floats above the water surface.',
    points: 10,
    vocabFocus: ['mist', 'floats', 'surface']
  },
  {
    passageId: 'temp-nature-1',
    type: 'true_false',
    question: 'Mist makes the hills look like shadows from a gentle dream.',
    correctAnswer: 'true',
    explanation: 'The text says "the hills on the other side look like shadows from a gentle dream" because of the mist.',
    points: 5,
    vocabFocus: ['mist', 'hills', 'shadows', 'dream']
  },
  {
    passageId: 'temp-nature-1',
    type: 'fill_blank',
    question: 'A small _____ stands still near the reeds, watching for tiny fish.',
    correctAnswer: 'heron',
    explanation: 'A heron is a tall bird that hunts fish in water.',
    points: 10,
    vocabFocus: ['heron', 'reeds', 'fish']
  },
  {
    passageId: 'temp-nature-1',
    type: 'true_false',
    question: 'Mai and her father shared tea from a thermos.',
    correctAnswer: 'true',
    explanation: 'They found a bench and shared a thermos of warm tea.',
    points: 5,
    vocabFocus: ['thermos', 'bench', 'warm tea']
  },
  {
    passageId: 'temp-nature-1',
    type: 'multiple_choice',
    question: 'What did Mai learn about at the garden?',
    options: ['Only flowers', 'Only trees', 'Native plants like moss, ferns, and wildflowers', 'Only insects'],
    correctAnswer: 2,
    explanation: 'Mai learned about moss, ferns, and wildflowers - native plants.',
    points: 10,
    vocabFocus: ['native plants', 'moss', 'ferns', 'wildflowers']
  }
];
