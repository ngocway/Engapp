import { Passage, Question, PassageVocab, EnglishLevel } from '../types';
import { passageService } from '../firebase/passageService';
import { questionService } from '../firebase/questionService';
import { topicService } from '../firebase/topicService';

// Template data for generating content
const TOPIC_TEMPLATES = {
  'travel': {
    themes: [
      'Airport Adventure', 'Train Journey', 'Bus Trip', 'Car Road Trip', 'Boat Cruise',
      'Hotel Stay', 'Restaurant Visit', 'Shopping Mall', 'Tourist Attraction', 'Museum Visit',
      'Beach Vacation', 'Mountain Hiking', 'City Tour', 'Theme Park', 'Zoo Visit',
      'Library Visit', 'Post Office', 'Bank Visit', 'Pharmacy', 'Hospital Visit'
    ],
    vocabTemplates: [
      { word: 'boarding pass', meaning: 'thẻ lên máy bay', pronunciation: '/ˈbɔːrdɪŋ pæs/' },
      { word: 'luggage', meaning: 'hành lý', pronunciation: '/ˈlʌɡɪdʒ/' },
      { word: 'passport', meaning: 'hộ chiếu', pronunciation: '/ˈpæspɔːrt/' },
      { word: 'ticket', meaning: 'vé', pronunciation: '/ˈtɪkɪt/' },
      { word: 'schedule', meaning: 'lịch trình', pronunciation: '/ˈskedʒuːl/' },
      { word: 'departure', meaning: 'khởi hành', pronunciation: '/dɪˈpɑːrtʃər/' },
      { word: 'arrival', meaning: 'đến nơi', pronunciation: '/əˈraɪvəl/' },
      { word: 'destination', meaning: 'điểm đến', pronunciation: '/ˌdestɪˈneɪʃn/' },
      { word: 'journey', meaning: 'hành trình', pronunciation: '/ˈdʒɜːrni/' },
      { word: 'adventure', meaning: 'cuộc phiêu lưu', pronunciation: '/ədˈventʃər/' },
      { word: 'explore', meaning: 'khám phá', pronunciation: '/ɪkˈsplɔːr/' },
      { word: 'souvenir', meaning: 'quà lưu niệm', pronunciation: '/ˌsuːvəˈnɪr/' },
      { word: 'guidebook', meaning: 'sách hướng dẫn', pronunciation: '/ˈɡaɪdbʊk/' },
      { word: 'camera', meaning: 'máy ảnh', pronunciation: '/ˈkæmərə/' },
      { word: 'backpack', meaning: 'ba lô', pronunciation: '/ˈbækpæk/' },
      { word: 'map', meaning: 'bản đồ', pronunciation: '/mæp/' },
      { word: 'compass', meaning: 'la bàn', pronunciation: '/ˈkʌmpəs/' },
      { word: 'binoculars', meaning: 'ống nhòm', pronunciation: '/bɪˈnɑːkjələrz/' },
      { word: 'telescope', meaning: 'kính thiên văn', pronunciation: '/ˈtelɪskoʊp/' },
      { word: 'flashlight', meaning: 'đèn pin', pronunciation: '/ˈflæʃlaɪt/' }
    ]
  },
  'daily-activities': {
    themes: [
      'Morning Routine', 'School Day', 'Lunch Break', 'After School', 'Homework Time',
      'Dinner Preparation', 'Family Time', 'Bedtime Story', 'Weekend Fun', 'Garden Work',
      'Cleaning Day', 'Cooking Class', 'Art Project', 'Music Practice', 'Sports Activity',
      'Reading Time', 'Writing Diary', 'Phone Call', 'Video Chat', 'Online Learning'
    ],
    vocabTemplates: [
      { word: 'routine', meaning: 'thói quen hàng ngày', pronunciation: '/ruːˈtiːn/' },
      { word: 'schedule', meaning: 'lịch trình', pronunciation: '/ˈskedʒuːl/' },
      { word: 'breakfast', meaning: 'bữa sáng', pronunciation: '/ˈbrekfəst/' },
      { word: 'lunch', meaning: 'bữa trưa', pronunciation: '/lʌntʃ/' },
      { word: 'dinner', meaning: 'bữa tối', pronunciation: '/ˈdɪnər/' },
      { word: 'homework', meaning: 'bài tập về nhà', pronunciation: '/ˈhoʊmwɜːrk/' },
      { word: 'chores', meaning: 'việc nhà', pronunciation: '/tʃɔːrz/' },
      { word: 'exercise', meaning: 'tập thể dục', pronunciation: '/ˈeksərsaɪz/' },
      { word: 'relaxation', meaning: 'thư giãn', pronunciation: '/ˌriːlækˈseɪʃn/' },
      { word: 'entertainment', meaning: 'giải trí', pronunciation: '/ˌentərˈteɪnmənt/' },
      { word: 'hobby', meaning: 'sở thích', pronunciation: '/ˈhɑːbi/' },
      { word: 'skill', meaning: 'kỹ năng', pronunciation: '/skɪl/' },
      { word: 'practice', meaning: 'luyện tập', pronunciation: '/ˈpræktɪs/' },
      { word: 'improvement', meaning: 'cải thiện', pronunciation: '/ɪmˈpruːvmənt/' },
      { word: 'achievement', meaning: 'thành tích', pronunciation: '/əˈtʃiːvmənt/' },
      { word: 'goal', meaning: 'mục tiêu', pronunciation: '/ɡoʊl/' },
      { word: 'plan', meaning: 'kế hoạch', pronunciation: '/plæn/' },
      { word: 'organization', meaning: 'tổ chức', pronunciation: '/ˌɔːrɡənəˈzeɪʃn/' },
      { word: 'efficiency', meaning: 'hiệu quả', pronunciation: '/ɪˈfɪʃənsi/' },
      { word: 'productivity', meaning: 'năng suất', pronunciation: '/ˌproʊdʌkˈtɪvəti/' }
    ]
  },
  'nature': {
    themes: [
      'Forest Walk', 'Beach Day', 'Mountain Climb', 'River Fishing', 'Garden Planting',
      'Bird Watching', 'Sunset Viewing', 'Rainy Day', 'Snowy Weather', 'Spring Flowers',
      'Summer Heat', 'Autumn Leaves', 'Winter Cold', 'Ocean Waves', 'Lake Swimming',
      'Camping Trip', 'Picnic Lunch', 'Nature Photography', 'Wildlife Observation', 'Star Gazing'
    ],
    vocabTemplates: [
      { word: 'landscape', meaning: 'phong cảnh', pronunciation: '/ˈlændskeɪp/' },
      { word: 'wildlife', meaning: 'động vật hoang dã', pronunciation: '/ˈwaɪldlaɪf/' },
      { word: 'ecosystem', meaning: 'hệ sinh thái', pronunciation: '/ˈiːkoʊsɪstəm/' },
      { word: 'environment', meaning: 'môi trường', pronunciation: '/ɪnˈvaɪrənmənt/' },
      { word: 'conservation', meaning: 'bảo tồn', pronunciation: '/ˌkɑːnsərˈveɪʃn/' },
      { word: 'pollution', meaning: 'ô nhiễm', pronunciation: '/pəˈluːʃn/' },
      { word: 'recycling', meaning: 'tái chế', pronunciation: '/ˌriːˈsaɪklɪŋ/' },
      { word: 'sustainability', meaning: 'bền vững', pronunciation: '/səˌsteɪnəˈbɪləti/' },
      { word: 'biodiversity', meaning: 'đa dạng sinh học', pronunciation: '/ˌbaɪoʊdaɪˈvɜːrsəti/' },
      { word: 'habitat', meaning: 'môi trường sống', pronunciation: '/ˈhæbɪtæt/' },
      { word: 'species', meaning: 'loài', pronunciation: '/ˈspiːʃiːz/' },
      { word: 'migration', meaning: 'di cư', pronunciation: '/maɪˈɡreɪʃn/' },
      { word: 'adaptation', meaning: 'thích nghi', pronunciation: '/ˌædæpˈteɪʃn/' },
      { word: 'evolution', meaning: 'tiến hóa', pronunciation: '/ˌiːvəˈluːʃn/' },
      { word: 'photosynthesis', meaning: 'quang hợp', pronunciation: '/ˌfoʊtoʊˈsɪnθəsɪs/' },
      { word: 'precipitation', meaning: 'lượng mưa', pronunciation: '/prɪˌsɪpɪˈteɪʃn/' },
      { word: 'temperature', meaning: 'nhiệt độ', pronunciation: '/ˈtemprətʃər/' },
      { word: 'humidity', meaning: 'độ ẩm', pronunciation: '/hjuːˈmɪdəti/' },
      { word: 'atmosphere', meaning: 'khí quyển', pronunciation: '/ˈætməsfɪr/' },
      { word: 'climate', meaning: 'khí hậu', pronunciation: '/ˈklaɪmət/' }
    ]
  }
};

const PASSAGE_TEMPLATES = {
  'travel': [
    "Today I went to the [airport] with my family. We checked our [luggage] and got our [boarding pass]. The [terminal] was very busy with many people. I saw a big [airplane] through the window. The [pilot] waved at us from the cockpit. We waited at [gate] number 12. Finally, it was time to [board] the plane. I felt excited about our [journey] to a new [destination].",
    "My family and I took a [train] to visit grandma. We bought [tickets] at the [station]. The [conductor] checked our tickets. I sat by the [window] and watched the [scenery] go by. We passed through [tunnels] and over [bridges]. The [journey] took three hours. I read a [book] and ate some [snacks]. When we arrived, grandma was waiting at the [platform].",
    "We stayed at a beautiful [hotel] by the beach. The [receptionist] gave us our [key cards]. Our [room] had a great view of the [ocean]. We went to the [restaurant] for dinner. The [waiter] was very friendly. I ordered [pasta] and [salad]. After dinner, we walked on the [beach]. The [waves] were gentle and the [sand] was soft. We collected some [shells] as [souvenirs]."
  ],
  'daily-activities': [
    "Every morning I follow the same [routine]. I wake up at 7 AM and brush my [teeth]. Then I eat [breakfast] with my family. I pack my [backpack] for school. My [schedule] includes math, science, and English. During [lunch] break, I play with my friends. After school, I do my [homework]. In the evening, I help with [chores] like setting the [table]. Before bed, I read a [story] with my parents.",
    "Today was a busy day at school. We had a [science] experiment in the [laboratory]. The [teacher] showed us how to use a [microscope]. We looked at [cells] and [bacteria]. After that, we had [art] class. I painted a picture of a [sunset]. The [paint] was bright and colorful. During [recess], I played [basketball] with my friends. We had a great [game] and everyone had fun. After school, I went to [music] practice.",
    "On weekends, I like to help in the [garden]. I plant [seeds] and water the [plants]. My dad showed me how to use [gardening] tools. We grew [tomatoes], [carrots], and [lettuce]. The [soil] was rich and dark. I learned about [photosynthesis] and how plants make [oxygen]. Gardening is a great [hobby] that teaches me about [nature]. I feel proud when I see my [vegetables] growing big and healthy."
  ],
  'nature': [
    "We went for a walk in the [forest] today. The [trees] were tall and green. I heard [birds] singing in the [branches]. We saw a [squirrel] collecting [nuts]. The [path] was covered with [leaves]. My dad pointed out different [plants] and [flowers]. We found a small [stream] with clear [water]. I saw [fish] swimming in the [pond]. The [air] was fresh and clean. Nature is so beautiful and peaceful.",
    "At the [beach], I built a [sandcastle] with my friends. The [waves] came and went. I collected colorful [shells] on the [shore]. The [sun] was bright and warm. We played [volleyball] on the [sand]. Later, we went [swimming] in the [ocean]. The [water] was cool and refreshing. I saw [seagulls] flying overhead. The [sunset] was amazing with orange and pink [colors]. I love spending time at the beach.",
    "In the [garden], I learned about [insects] and [butterflies]. The [bees] were busy collecting [pollen] from [flowers]. I saw a [caterpillar] on a [leaf]. My teacher explained the [life cycle] of a [butterfly]. We planted [seeds] in small [pots]. I watered them every day. Soon, tiny [sprouts] appeared. I learned that plants need [sunlight], [water], and [soil] to grow. Gardening teaches me about [patience] and [care]."
  ]
};

const QUESTION_TEMPLATES = {
  'multiple_choice': [
    "What is the main topic of this passage?",
    "Where does this story take place?",
    "What did the character do first?",
    "How did the character feel?",
    "What happened at the end?",
    "What was the character's goal?",
    "What tool did they use?",
    "What time of day was it?"
  ],
  'fill_blank': [
    "The character went to the _____ to buy tickets.",
    "They used a _____ to see small things.",
    "The _____ was very tall and green.",
    "They collected _____ on the beach.",
    "The _____ was bright and warm.",
    "They planted _____ in the garden.",
    "The _____ was busy with people.",
    "They learned about _____ in science class."
  ],
  'true_false': [
    "The character felt excited about the journey.",
    "They stayed at a hotel by the beach.",
    "The weather was rainy and cold.",
    "They collected shells as souvenirs.",
    "The garden had many different plants.",
    "They used a microscope in the laboratory.",
    "The train journey took five hours.",
    "They played basketball during recess."
  ]
};

export class ContentGeneratorService {
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private static generatePassageText(topicSlug: string, theme: string, vocabWords: string[]): string {
    const templates = PASSAGE_TEMPLATES[topicSlug as keyof typeof PASSAGE_TEMPLATES];
    if (!templates) return '';

    let template = this.getRandomElement(templates);
    
    // Replace placeholders with actual vocab words from our selected vocab
    const placeholders = template.match(/\[([^\]]+)\]/g);
    if (placeholders) {
      placeholders.forEach((placeholder, index) => {
        if (index < vocabWords.length) {
          template = template.replace(placeholder, `[${vocabWords[index]}]`);
        }
      });
    }

    return template;
  }

  private static generateVocabForPassage(topicSlug: string, passageText: string, vocabWords: string[]): PassageVocab[] {
    const topicData = TOPIC_TEMPLATES[topicSlug as keyof typeof TOPIC_TEMPLATES];
    if (!topicData) return [];

    // Use the vocab words that were passed in
    return vocabWords.map((word, index) => {
      // Find matching vocab template or use default
      const vocabTemplate = topicData.vocabTemplates.find(v => v.word === word) || 
                           topicData.vocabTemplates[index % topicData.vocabTemplates.length];
      
      return {
        term: word,
        meaning: vocabTemplate.meaning,
        pronunciation: vocabTemplate.pronunciation,
        image: `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
        phonetics: {
          us: vocabTemplate.pronunciation,
          uk: vocabTemplate.pronunciation
        },
        definitionEn: `English definition for ${word}`,
        explanationEn: `A word related to ${topicSlug} activities`,
        examples: [
          `I saw a ${word} at the ${topicSlug} location.`,
          `The ${word} was very interesting.`
        ],
        partOfSpeech: 'noun'
      };
    });
  }

  private static generateQuestionsForPassage(passageId: string, passageText: string, vocabWords: string[]): Question[] {
    const questions: Question[] = [];
    
    // Generate 3 multiple choice questions
    for (let i = 0; i < 3; i++) {
      const template = this.getRandomElement(QUESTION_TEMPLATES.multiple_choice);
      const options = ['Option A', 'Option B', 'Option C', 'Option D'];
      questions.push({
        id: '', // ID sẽ được tạo bởi Firebase
        passageId,
        type: 'multiple_choice',
        question: template,
        options,
        correctAnswer: 0,
        explanation: 'This is the correct answer based on the passage content.',
        points: 10,
        vocabFocus: this.getRandomElements(vocabWords, 2),
        createdAt: Date.now()
      });
    }

    // Generate 3 fill in the blank questions
    for (let i = 0; i < 3; i++) {
      const template = this.getRandomElement(QUESTION_TEMPLATES.fill_blank);
      const vocabWord = this.getRandomElement(vocabWords);
      questions.push({
        id: '', // ID sẽ được tạo bởi Firebase
        passageId,
        type: 'fill_blank',
        question: template.replace('_____', vocabWord),
        correctAnswer: vocabWord,
        explanation: `The correct answer is ${vocabWord}.`,
        points: 10,
        vocabFocus: [vocabWord],
        createdAt: Date.now()
      });
    }

    // Generate 2 true/false questions
    for (let i = 0; i < 2; i++) {
      const template = this.getRandomElement(QUESTION_TEMPLATES.true_false);
      questions.push({
        id: '', // ID sẽ được tạo bởi Firebase
        passageId,
        type: 'true_false',
        question: template,
        correctAnswer: Math.random() > 0.5,
        explanation: 'This statement is based on the passage content.',
        points: 10,
        vocabFocus: this.getRandomElements(vocabWords, 1),
        createdAt: Date.now()
      });
    }

    return questions;
  }

  private static getRandomEnglishLevel(): EnglishLevel {
    const levels: EnglishLevel[] = ['kids-2-4', 'kids-5-10', 'basic', 'independent', 'proficient'];
    return this.getRandomElement(levels);
  }

  private static getRandomLayoutRatio(): '4:6' | '5:5' {
    return Math.random() > 0.5 ? '4:6' : '5:5';
  }

  public static async generatePassagesForAllTopics(): Promise<void> {
    try {
      console.log('🚀 Bắt đầu tạo 20 bài văn cho mỗi chủ đề...');
      
      // Get all topics
      const topics = await topicService.getAll();
      console.log(`📚 Tìm thấy ${topics.length} chủ đề:`, topics.map(t => t.title));
      
      if (topics.length === 0) {
        console.error('❌ Không tìm thấy chủ đề nào trong database!');
        throw new Error('Không tìm thấy chủ đề nào trong database');
      }

      for (const topic of topics) {
        console.log(`\n📖 Đang tạo bài văn cho chủ đề: ${topic.title}`);
        console.log(`📖 Topic data:`, topic);
        console.log(`📖 Topic level:`, topic.level);
        console.log(`📖 Topic slug:`, topic.slug);
        
        const topicData = TOPIC_TEMPLATES[topic.slug as keyof typeof TOPIC_TEMPLATES];
        if (!topicData) {
          console.log(`⚠️ Không tìm thấy template cho chủ đề: ${topic.slug}`);
          continue;
        }

        // Generate 20 passages for this topic
        for (let i = 1; i <= 20; i++) {
          const theme = this.getRandomElement(topicData.themes);
          const vocabWords = this.getRandomElements(
            topicData.vocabTemplates.map(v => v.word), 
            8
          );

          // Generate passage text with vocab words in brackets
          const passageText = this.generatePassageText(topic.slug!, theme, vocabWords);
          
          // Generate vocabulary for this passage
          const vocab = this.generateVocabForPassage(topic.slug!, passageText, vocabWords);

          // Ensure all required fields have valid values
          const passageLevel = typeof topic.level === 'number' ? topic.level : 1;
          const passageTopicId = topic.id || '';
          const passageTopicSlug = topic.slug || '';

          // Create passage object
          const passage: Omit<Passage, 'id'> = {
            title: `${theme} - Part ${i}`,
            text: passageText,
            translation: `Bản dịch tiếng Việt cho ${theme}`,
            excerpt: `Một câu chuyện thú vị về ${theme.toLowerCase()}`,
            thumbnail: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
            level: passageLevel,
            englishLevel: this.getRandomEnglishLevel(),
            englishLevels: [this.getRandomEnglishLevel()],
            topicId: passageTopicId,
            topicSlug: passageTopicSlug,
            createdAt: Date.now(),
            vocab,
            layoutRatio: this.getRandomLayoutRatio(),
            images: [
              `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
              `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`
            ]
          };

          // Validate passage data before saving
          if (!passage.title || !passage.text || !passage.topicId || !passage.topicSlug) {
            console.error(`❌ Dữ liệu bài văn không hợp lệ:`, passage);
            continue;
          }

          // Add passage to database
          console.log(`📝 Đang lưu bài văn: ${passage.title}`);
          console.log(`📝 Nội dung: ${passage.text.substring(0, 100)}...`);
          console.log(`📝 Số từ vựng: ${passage.vocab?.length || 0}`);
          console.log(`📝 Level: ${passage.level}, TopicId: ${passage.topicId}, TopicSlug: ${passage.topicSlug}`);
          
          const passageId = await passageService.add(passage);
          if (passageId) {
            console.log(`✅ Đã tạo bài văn: ${passage.title} (ID: ${passageId})`);

            // Generate 8 questions for this passage
            const questions = this.generateQuestionsForPassage(passageId, passageText, vocabWords);
            console.log(`📝 Đã tạo ${questions.length} câu hỏi`);
            
            for (const question of questions) {
              const questionId = await questionService.add(question);
              if (questionId) {
                console.log(`  ✅ Đã tạo câu hỏi: ${question.question.substring(0, 50)}...`);
              } else {
                console.log(`  ❌ Lỗi khi tạo câu hỏi: ${question.question.substring(0, 50)}...`);
              }
            }
          } else {
            console.log(`❌ Lỗi khi tạo bài văn: ${passage.title}`);
          }
        }
      }

      console.log('\n🎉 Hoàn thành tạo tất cả bài văn và câu hỏi!');
    } catch (error) {
      console.error('❌ Lỗi khi tạo bài văn:', error);
      throw error;
    }
  }

  public static async generatePassagesForTopic(topicSlug: string, count: number = 20): Promise<void> {
    try {
      console.log(`🚀 Bắt đầu tạo ${count} bài văn cho chủ đề: ${topicSlug}`);
      
      const topic = await topicService.getBySlug(topicSlug);
      if (topic.length === 0) {
        throw new Error(`Không tìm thấy chủ đề: ${topicSlug}`);
      }

      const topicData = TOPIC_TEMPLATES[topicSlug as keyof typeof TOPIC_TEMPLATES];
      if (!topicData) {
        throw new Error(`Không tìm thấy template cho chủ đề: ${topicSlug}`);
      }

      const topicInfo = topic[0];

      for (let i = 1; i <= count; i++) {
        const theme = this.getRandomElement(topicData.themes);
        const vocabWords = this.getRandomElements(
          topicData.vocabTemplates.map(v => v.word), 
          8
        );

        const passageText = this.generatePassageText(topicSlug, theme, vocabWords);
        const vocab = this.generateVocabForPassage(topicSlug, passageText, vocabWords);

        // Ensure all required fields have valid values
        const passageLevel = typeof topicInfo.level === 'number' ? topicInfo.level : 1;
        const passageTopicId = topicInfo.id || '';
        const passageTopicSlug = topicSlug || '';

        const passage: Omit<Passage, 'id'> = {
          title: `${theme} - Part ${i}`,
          text: passageText,
          translation: `Bản dịch tiếng Việt cho ${theme}`,
          excerpt: `Một câu chuyện thú vị về ${theme.toLowerCase()}`,
          thumbnail: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
          level: passageLevel,
          englishLevel: this.getRandomEnglishLevel(),
          englishLevels: [this.getRandomEnglishLevel()],
          topicId: passageTopicId,
          topicSlug: passageTopicSlug,
          createdAt: Date.now(),
          vocab,
          layoutRatio: this.getRandomLayoutRatio(),
          images: [
            `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
            `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`
          ]
        };

        // Validate passage data before saving
        if (!passage.title || !passage.text || !passage.topicId || !passage.topicSlug) {
          console.error(`❌ Dữ liệu bài văn không hợp lệ:`, passage);
          continue;
        }

        console.log(`📝 Đang lưu bài văn: ${passage.title}`);
        console.log(`📝 Level: ${passage.level}, TopicId: ${passage.topicId}, TopicSlug: ${passage.topicSlug}`);
        
        const passageId = await passageService.add(passage);
        if (passageId) {
          console.log(`✅ Đã tạo bài văn: ${passage.title} (ID: ${passageId})`);

          const questions = this.generateQuestionsForPassage(passageId, passageText, vocabWords);
          
          for (const question of questions) {
            await questionService.add(question);
          }
        } else {
          console.log(`❌ Lỗi khi tạo bài văn: ${passage.title}`);
        }
      }

      console.log(`🎉 Hoàn thành tạo ${count} bài văn cho chủ đề: ${topicSlug}`);
    } catch (error) {
      console.error(`❌ Lỗi khi tạo bài văn cho chủ đề ${topicSlug}:`, error);
      throw error;
    }
  }
}
