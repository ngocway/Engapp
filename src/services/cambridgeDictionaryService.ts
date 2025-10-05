// Cambridge Dictionary Service
// This service fetches vocabulary data from Cambridge Dictionary

interface CambridgeVocabData {
  term: string;
  meaning: string;
  partOfSpeech: string;
  definitionEn: string;
  imageUrl: string;
  phonetics: {
    uk: string;
    us: string;
  };
  examples: string[];
  topicSlug: string;
  level: number;
}

export class CambridgeDictionaryService {
  private static readonly BASE_URL = 'https://dictionary.cambridge.org/vi/dictionary/english/';
  
  // Mock implementation - in a real app, you would need to:
  // 1. Use a web scraping service (like Puppeteer)
  // 2. Use Cambridge Dictionary API if available
  // 3. Or use a third-party dictionary API
  static async fetchVocabularyData(word: string, topicSlug: string = ''): Promise<CambridgeVocabData | null> {
    try {
      console.log(`Fetching data for word: ${word} from Cambridge Dictionary`);
      
      // For now, we'll create enhanced mock data
      // In a real implementation, you would scrape the Cambridge Dictionary page
      const enhancedMockData: CambridgeVocabData = {
        term: word,
        meaning: this.getVietnameseMeaning(word),
        partOfSpeech: this.getPartOfSpeech(word),
        definitionEn: this.getEnglishDefinition(word),
        imageUrl: this.getImageUrl(word),
        phonetics: {
          uk: this.getUKPhonetic(word),
          us: this.getUSPhonetic(word)
        },
        examples: this.getExamples(word),
        topicSlug,
        level: 1
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return enhancedMockData;
    } catch (error) {
      console.error('Error fetching vocabulary data from Cambridge Dictionary:', error);
      return null;
    }
  }
  
  private static getVietnameseMeaning(word: string): string {
    const meanings: Record<string, string> = {
      'quiet': 'yên tĩnh, im lặng',
      'silver': 'bạc, màu bạc',
      'mirror': 'gương',
      'ripple': 'gợn sóng, sóng lăn tăn',
      'wooden': 'bằng gỗ',
      'path': 'đường đi, lối đi',
      'sunrise': 'bình minh, lúc mặt trời mọc',
      'lake': 'hồ',
      'father': 'cha, bố',
      'counting': 'đếm, tính toán'
    };
    
    return meanings[word.toLowerCase()] || `Nghĩa của từ ${word}`;
  }
  
  private static getPartOfSpeech(word: string): string {
    const partsOfSpeech: Record<string, string> = {
      'quiet': 'adjective',
      'silver': 'noun',
      'mirror': 'noun',
      'ripple': 'noun',
      'wooden': 'adjective',
      'path': 'noun',
      'sunrise': 'noun',
      'lake': 'noun',
      'father': 'noun',
      'counting': 'verb'
    };
    
    return partsOfSpeech[word.toLowerCase()] || 'noun';
  }
  
  private static getEnglishDefinition(word: string): string {
    const definitions: Record<string, string> = {
      'quiet': 'making very little noise',
      'silver': 'a precious metal that is greyish white in colour',
      'mirror': 'a piece of glass with a shiny metal-covered back that reflects light',
      'ripple': 'a small wave on the surface of water',
      'wooden': 'made of wood',
      'path': 'a route or track between one place and another',
      'sunrise': 'the time in the morning when the sun appears',
      'lake': 'a large area of water surrounded by land',
      'father': 'a male parent',
      'counting': 'to say numbers one after the other in order'
    };
    
    return definitions[word.toLowerCase()] || `Definition of ${word}`;
  }
  
  private static getImageUrl(word: string): string {
    // Use Unsplash API to get relevant images
    const imageKeywords: Record<string, string> = {
      'quiet': 'silence,peaceful',
      'silver': 'silver,metal',
      'mirror': 'mirror,reflection',
      'ripple': 'water,ripples',
      'wooden': 'wood,wooden',
      'path': 'path,trail',
      'sunrise': 'sunrise,morning',
      'lake': 'lake,water',
      'father': 'father,dad',
      'counting': 'counting,numbers'
    };
    
    const keyword = imageKeywords[word.toLowerCase()] || word;
    return `https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
  }
  
  private static getUKPhonetic(word: string): string {
    const phonetics: Record<string, string> = {
      'quiet': '/ˈkwaɪ.ət/',
      'silver': '/ˈsɪl.vər/',
      'mirror': '/ˈmɪr.ər/',
      'ripple': '/ˈrɪp.əl/',
      'wooden': '/ˈwʊd.ən/',
      'path': '/pɑːθ/',
      'sunrise': '/ˈsʌn.raɪz/',
      'lake': '/leɪk/',
      'father': '/ˈfɑː.ðər/',
      'counting': '/ˈkaʊn.tɪŋ/'
    };
    
    return phonetics[word.toLowerCase()] || `/${word}/`;
  }
  
  private static getUSPhonetic(word: string): string {
    const phonetics: Record<string, string> = {
      'quiet': '/ˈkwaɪ.ət/',
      'silver': '/ˈsɪl.vɚ/',
      'mirror': '/ˈmɪr.ɚ/',
      'ripple': '/ˈrɪp.əl/',
      'wooden': '/ˈwʊd.ən/',
      'path': '/pæθ/',
      'sunrise': '/ˈsʌn.raɪz/',
      'lake': '/leɪk/',
      'father': '/ˈfɑː.ðɚ/',
      'counting': '/ˈkaʊn.tɪŋ/'
    };
    
    return phonetics[word.toLowerCase()] || `/${word}/`;
  }
  
  private static getExamples(word: string): string[] {
    const examples: Record<string, string[]> = {
      'quiet': [
        'The library was very quiet.',
        'Please be quiet during the exam.'
      ],
      'silver': [
        'She wore a silver necklace.',
        'The silver moon shone brightly.'
      ],
      'mirror': [
        'She looked at herself in the mirror.',
        'The lake was like a mirror.'
      ],
      'ripple': [
        'A small ripple appeared on the water.',
        'The stone created ripples in the pond.'
      ],
      'wooden': [
        'The wooden table was old.',
        'They walked on a wooden bridge.'
      ],
      'path': [
        'Follow the path through the forest.',
        'The path led to the lake.'
      ],
      'sunrise': [
        'We watched the sunrise together.',
        'The sunrise was beautiful this morning.'
      ],
      'lake': [
        'The lake was calm and peaceful.',
        'We went fishing in the lake.'
      ],
      'father': [
        'My father is a teacher.',
        'The father and son went fishing.'
      ],
      'counting': [
        'She was counting the stars.',
        'The children were counting their toys.'
      ]
    };
    
    return examples[word.toLowerCase()] || [`Example sentence with ${word}`];
  }
  
  // Method to get the Cambridge Dictionary URL for a word
  static getDictionaryUrl(word: string): string {
    return `${this.BASE_URL}${word.toLowerCase()}`;
  }
}







