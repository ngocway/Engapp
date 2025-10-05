// Sample questions data
export const questionSeeds = [
  // Questions for "Morning by the Lake"
  {
    passageId: 'temp-nature-1',
    type: 'multiple_choice' as const,
    question: 'What time does Sarah wake up in the morning?',
    options: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'],
    correctAnswer: '6:00 AM',
    explanation: 'The text mentions that Sarah wakes up at 6:00 AM every morning.',
    points: 10,
    vocabFocus: ['wake up', 'morning']
  },
  {
    passageId: 'temp-nature-1',
    type: 'fill_blank' as const,
    question: 'Sarah likes to sit by the _____ and watch the water.',
    correctAnswer: 'lake',
    explanation: 'The text describes Sarah sitting by the lake to watch the water.',
    points: 10,
    vocabFocus: ['lake', 'water']
  },
  {
    passageId: 'temp-nature-1',
    type: 'true_false' as const,
    question: 'Sarah finds peace and quiet by the lake.',
    correctAnswer: true,
    explanation: 'The text clearly states that Sarah finds peace and quiet in this peaceful place.',
    points: 10,
    vocabFocus: ['peace', 'quiet']
  }
];

// Export empty object to make it a module
export {};