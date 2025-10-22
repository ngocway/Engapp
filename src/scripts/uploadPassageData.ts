import { passageService } from '../firebase/passageService';

// Dữ liệu passages mẫu
const samplePassages = [
  {
    title: "My Daily Routine",
    text: "I wake up at 7 AM every day. First, I brush my teeth and wash my face. Then I have breakfast with my family. After breakfast, I go to school by bus. At school, I study many subjects like math, English, and science. I have lunch at 12 PM in the school cafeteria. In the afternoon, I play with my friends during recess. I finish school at 4 PM and go home. At home, I do my homework and help my mother cook dinner. After dinner, I watch TV or read books. I go to bed at 10 PM.",
    topicSlug: "daily-life",
    topicId: "daily-life-topic",
    level: 1,
    vocab: [
      {
        term: "wake up",
        meaning: "thức dậy",
        pronunciation: "/weɪk ʌp/",
        partOfSpeech: "verb",
        examples: ["I wake up early every morning.", "What time do you wake up?"]
      },
      {
        term: "breakfast",
        meaning: "bữa sáng",
        pronunciation: "/ˈbrekfəst/",
        partOfSpeech: "noun",
        examples: ["I eat breakfast at 8 AM.", "What do you have for breakfast?"]
      },
      {
        term: "homework",
        meaning: "bài tập về nhà",
        pronunciation: "/ˈhoʊmwɜːrk/",
        partOfSpeech: "noun",
        examples: ["I do my homework after school.", "She finished her homework quickly."]
      }
    ],
    questions: [
      {
        id: "q1",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What time does the person wake up?",
        options: ["6 AM", "7 AM", "8 AM", "9 AM"],
        correctAnswer: 1,
        points: 10
      },
      {
        id: "q2",
        passageId: "",
        type: "multiple_choice" as const,
        question: "How does the person go to school?",
        options: ["By car", "By bus", "By bike", "On foot"],
        correctAnswer: 1,
        points: 10
      },
      {
        id: "q3",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What does the person do after dinner?",
        options: ["Go to sleep", "Watch TV or read books", "Do homework", "Play games"],
        correctAnswer: 1,
        points: 10
      }
    ]
  },
  {
    title: "My Favorite Animal",
    text: "My favorite animal is a cat. Cats are very cute and fluffy. They have soft fur and beautiful eyes. Cats like to play with balls and strings. They can jump very high and run very fast. Cats sleep a lot during the day. They like to sit in warm places like windowsills or on soft cushions. Cats make a sound called meowing. They purr when they are happy. I love cats because they are friendly and playful animals.",
    topicSlug: "animals",
    topicId: "animals-topic",
    level: 1,
    vocab: [
      {
        term: "fluffy",
        meaning: "mềm mại, xù lông",
        pronunciation: "/ˈflʌfi/",
        partOfSpeech: "adjective",
        examples: ["The cat has fluffy fur.", "I love fluffy pillows."]
      },
      {
        term: "meowing",
        meaning: "tiếng kêu của mèo",
        pronunciation: "/ˈmiːaʊɪŋ/",
        partOfSpeech: "noun",
        examples: ["The cat's meowing woke me up.", "I heard a loud meowing sound."]
      },
      {
        term: "purr",
        meaning: "tiếng gừ gừ của mèo",
        pronunciation: "/pɜːr/",
        partOfSpeech: "verb",
        examples: ["The cat purrs when I pet it.", "Happy cats often purr."]
      }
    ],
    questions: [
      {
        id: "q4",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What is the person's favorite animal?",
        options: ["Dog", "Cat", "Bird", "Fish"],
        correctAnswer: 1,
        points: 10
      },
      {
        id: "q5",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What sound do cats make?",
        options: ["Barking", "Meowing", "Chirping", "Roaring"],
        correctAnswer: 1,
        points: 10
      },
      {
        id: "q6",
        passageId: "",
        type: "multiple_choice" as const,
        question: "When do cats purr?",
        options: ["When they are angry", "When they are happy", "When they are hungry", "When they are scared"],
        correctAnswer: 1,
        points: 10
      }
    ]
  },
  {
    title: "The Weather Today",
    text: "Today is a beautiful sunny day. The sky is blue and there are white clouds floating in the air. The temperature is warm but not too hot. I can see birds flying in the sky and people walking in the park. Some children are playing with a ball on the grass. The trees are green and the flowers are blooming. It's a perfect day for a picnic or a walk in the park. I hope the weather stays nice like this tomorrow too.",
    topicSlug: "weather",
    topicId: "weather-topic",
    level: 2,
    vocab: [
      {
        term: "floating",
        meaning: "trôi nổi, bay lơ lửng",
        pronunciation: "/ˈfloʊtɪŋ/",
        partOfSpeech: "adjective",
        examples: ["Clouds are floating in the sky.", "The boat is floating on the water."]
      },
      {
        term: "blooming",
        meaning: "nở hoa",
        pronunciation: "/ˈbluːmɪŋ/",
        partOfSpeech: "adjective",
        examples: ["The flowers are blooming in spring.", "Beautiful blooming roses."]
      },
      {
        term: "picnic",
        meaning: "dã ngoại",
        pronunciation: "/ˈpɪknɪk/",
        partOfSpeech: "noun",
        examples: ["We had a picnic in the park.", "Let's go for a picnic this weekend."]
      }
    ],
    questions: [
      {
        id: "q7",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What is the weather like today?",
        options: ["Rainy", "Cloudy", "Sunny", "Snowy"],
        correctAnswer: 2,
        points: 10
      },
      {
        id: "q8",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What are the children doing?",
        options: ["Reading books", "Playing with a ball", "Swimming", "Eating ice cream"],
        correctAnswer: 1,
        points: 10
      },
      {
        id: "q9",
        passageId: "",
        type: "multiple_choice" as const,
        question: "What does the person hope for tomorrow?",
        options: ["It will rain", "It will be cold", "The weather stays nice", "It will be windy"],
        correctAnswer: 2,
        points: 10
      }
    ]
  }
];

// Script để upload passages mẫu lên Firebase
export const uploadPassageData = async () => {
  console.log('🚀 Bắt đầu upload passages mẫu lên Firebase...');
  
  try {
    for (const passage of samplePassages) {
      const docId = await passageService.add(passage);
      
      if (docId) {
        console.log(`✅ Đã upload passage: ${passage.title} với ID: ${docId}`);
      } else {
        console.error(`❌ Lỗi khi upload passage: ${passage.title}`);
      }
    }
    
    console.log('🎉 Hoàn thành upload passages mẫu!');
  } catch (error) {
    console.error('❌ Lỗi khi upload passages:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (typeof window !== 'undefined') {
  // Chỉ chạy trong browser
  (window as any).uploadPassageData = uploadPassageData;
}
