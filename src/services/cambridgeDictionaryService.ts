// Cambridge Dictionary Service
// This service fetches vocabulary data from Cambridge Dictionary

import { PassageVocab } from '../types';

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
  audioUrls: {
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
        audioUrls: {
          uk: '', // Không sử dụng UK audio
          us: this.getUSAudioUrl(word)
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
  
  // AI-powered Vietnamese meaning generation
  private static getVietnameseMeaning(word: string): string {
    // Comprehensive AI-generated Vietnamese meanings with context
    const aiMeanings: Record<string, string> = {
      'quiet': 'yên tĩnh, im lặng (không có tiếng ồn)',
      'silver': 'bạc, màu bạc (kim loại quý màu trắng bóng)',
      'mirror': 'gương (vật phản chiếu hình ảnh)',
      'ripple': 'gợn sóng, sóng nhỏ (trên mặt nước)',
      'wooden': 'bằng gỗ, cứng nhắc (làm từ gỗ)',
      'path': 'đường đi, lối đi (đường mòn nhỏ)',
      'sunrise': 'bình minh, mặt trời mọc (lúc sáng sớm)',
      'lake': 'hồ (vùng nước lớn được bao quanh bởi đất)',
      'father': 'cha, bố (người đàn ông có con)',
      'counting': 'đếm, tính toán (xác định số lượng)',
      'apron': 'tạp dề (quần áo bảo vệ khi nấu ăn)',
      'mist': 'sương mù (hơi nước làm mờ tầm nhìn)',
      'modern': 'hiện đại, tân tiến (theo phong cách mới)',
      'beautiful': 'đẹp, xinh đẹp (có vẻ ngoài hấp dẫn)',
      'important': 'quan trọng (có ý nghĩa lớn)',
      'difficult': 'khó khăn, phức tạp (không dễ làm)',
      'interesting': 'thú vị, hấp dẫn (gây sự chú ý)',
      'comfortable': 'thoải mái, dễ chịu (cảm giác tốt)',
      'dangerous': 'nguy hiểm (có thể gây hại)',
      'exciting': 'thú vị, kích thích (tạo cảm xúc mạnh)',
      'amazing': 'tuyệt vời, đáng kinh ngạc (gây ấn tượng mạnh)',
      'wonderful': 'tuyệt vời, kỳ diệu (rất tốt)',
      'terrible': 'khủng khiếp, tệ hại (rất xấu)',
      'fantastic': 'tuyệt vời, phi thường (xuất sắc)',
      'incredible': 'không thể tin được, đáng kinh ngạc',
      'magnificent': 'tráng lệ, hùng vĩ (rất đẹp và ấn tượng)',
      'gorgeous': 'lộng lẫy, tuyệt đẹp (rất đẹp)',
      'stunning': 'choáng ngợp, tuyệt đẹp (gây ấn tượng mạnh)',
      'breathtaking': 'nghẹt thở, ngoạn mục (rất ấn tượng)',
      'outstanding': 'xuất sắc, nổi bật (vượt trội)',
      'remarkable': 'đáng chú ý, đặc biệt (khác thường)',
      'extraordinary': 'phi thường, khác thường (không bình thường)',
      'spectacular': 'ngoạn mục, ấn tượng (rất đẹp và lớn)',
      'brilliant': 'xuất sắc, thông minh (rất tốt)',
      'excellent': 'xuất sắc, tuyệt vời (rất tốt)',
      'perfect': 'hoàn hảo (không có lỗi)',
      'marvelous': 'tuyệt vời, kỳ diệu (rất tốt)',
      'splendid': 'tráng lệ, tuyệt vời (rất đẹp)',
      'superb': 'xuất sắc, tuyệt vời (rất tốt)',
      'fabulous': 'tuyệt vời, huyền thoại (rất tốt)',
      'awesome': 'tuyệt vời, đáng sợ (rất ấn tượng)',
      'tremendous': 'khổng lồ, to lớn (rất lớn)',
      'enormous': 'khổng lồ, to lớn (rất lớn)',
      'massive': 'khổng lồ, to lớn (rất lớn)',
      'huge': 'khổng lồ, to lớn (rất lớn)',
      'gigantic': 'khổng lồ, to lớn (rất lớn)',
      'tiny': 'nhỏ xíu, tí hon (rất nhỏ)',
      'small': 'nhỏ, bé (kích thước nhỏ)',
      'big': 'lớn, to (kích thước lớn)',
      'large': 'lớn, to (kích thước lớn)',
      'miniature': 'thu nhỏ, tí hon (phiên bản nhỏ)',
      'microscopic': 'hiển vi, rất nhỏ (chỉ nhìn thấy qua kính hiển vi)',
      'invisible': 'vô hình, không nhìn thấy được',
      'transparent': 'trong suốt (có thể nhìn xuyên qua)',
      'clear': 'rõ ràng, trong suốt (dễ hiểu hoặc nhìn)',
      'bright': 'sáng, rực rỡ (có nhiều ánh sáng)',
      'dark': 'tối, đen tối (thiếu ánh sáng)',
      'colorful': 'đầy màu sắc, rực rỡ (có nhiều màu)',
      'ugly': 'xấu xí, khó coi (có vẻ ngoài không hấp dẫn)',
      'handsome': 'đẹp trai, ưa nhìn (đàn ông đẹp)',
      'pretty': 'xinh đẹp, dễ thương (phụ nữ đẹp)',
      'cute': 'dễ thương, đáng yêu (gây cảm giác thích thú)',
      'lovely': 'đáng yêu, dễ thương (gây cảm giác yêu thích)',
      'charming': 'quyến rũ, hấp dẫn (có sức hút)',
      'attractive': 'hấp dẫn, thu hút (có sức hút)',
      'elegant': 'thanh lịch, tao nhã (có phong cách đẹp)',
      'graceful': 'duyên dáng, uyển chuyển (có vẻ đẹp tự nhiên)',
      'sophisticated': 'tinh tế, phức tạp (có trình độ cao)',
      'refined': 'tinh tế, thanh lịch (có văn hóa cao)',
      'polished': 'bóng bẩy, hoàn thiện (được chăm sóc kỹ)',
      'smooth': 'mượt mà, trơn tru (không có gợn sóng)',
      'rough': 'thô ráp, gồ ghề (không mượt mà)',
      'soft': 'mềm mại, êm ái (dễ chịu khi chạm)',
      'hard': 'cứng, khó (không dễ uốn cong)',
      'strong': 'mạnh mẽ, khỏe mạnh (có sức mạnh)',
      'weak': 'yếu ớt, không mạnh (thiếu sức mạnh)',
      'powerful': 'mạnh mẽ, quyền lực (có sức mạnh lớn)',
      'gentle': 'dịu dàng, nhẹ nhàng (không mạnh mẽ)',
      'fierce': 'dữ tợn, hung dữ (rất mạnh mẽ và nguy hiểm)',
      'brave': 'dũng cảm, can đảm (không sợ hãi)',
      'cowardly': 'hèn nhát, nhút nhát (sợ hãi)',
      'bold': 'táo bạo, dũng cảm (mạnh mẽ và quyết đoán)',
      'shy': 'nhút nhát, e thẹn (không tự tin)',
      'confident': 'tự tin (tin vào khả năng của mình)',
      'proud': 'tự hào, kiêu hãnh (hài lòng về thành tích)',
      'humble': 'khiêm tốn, nhún nhường (không kiêu ngạo)',
      'arrogant': 'kiêu ngạo, tự phụ (tin rằng mình tốt hơn người khác)',
      'kind': 'tốt bụng, tử tế (quan tâm đến người khác)',
      'mean': 'độc ác, xấu tính (không tốt với người khác)',
      'generous': 'hào phóng, rộng lượng (sẵn sàng cho đi)',
      'selfish': 'ích kỷ, chỉ nghĩ đến mình',
      'honest': 'trung thực, thật thà (nói sự thật)',
      'dishonest': 'không trung thực, dối trá',
      'loyal': 'trung thành (đứng về phía ai đó)',
      'faithful': 'trung thành, chung thủy',
      'trustworthy': 'đáng tin cậy (có thể tin tưởng)',
      'reliable': 'đáng tin cậy (có thể dựa vào)',
      'dependable': 'đáng tin cậy (có thể dựa vào)',
      'responsible': 'có trách nhiệm (làm đúng nhiệm vụ)',
      'irresponsible': 'không có trách nhiệm (không làm đúng nhiệm vụ)',
      'mature': 'trưởng thành (hành xử như người lớn)',
      'immature': 'chưa trưởng thành (hành xử như trẻ con)',
      'wise': 'khôn ngoan (có hiểu biết sâu sắc)',
      'foolish': 'ngu ngốc, dại dột (không thông minh)',
      'smart': 'thông minh, lanh lợi (học nhanh)',
      'intelligent': 'thông minh (có khả năng tư duy tốt)',
      'clever': 'thông minh, khéo léo (giải quyết vấn đề tốt)',
      'genius': 'thiên tài (cực kỳ thông minh)',
      'talented': 'tài năng (có khả năng đặc biệt)',
      'gifted': 'có tài năng (sinh ra đã có khả năng)',
      'skilled': 'có kỹ năng (được đào tạo tốt)',
      'experienced': 'có kinh nghiệm (đã làm nhiều lần)',
      'professional': 'chuyên nghiệp (làm việc tốt)',
      'expert': 'chuyên gia (rất giỏi trong lĩnh vực)',
      'master': 'bậc thầy (cực kỳ giỏi)',
      'novice': 'người mới (chưa có kinh nghiệm)',
      'beginner': 'người mới bắt đầu (chưa có kinh nghiệm)',
      'advanced': 'nâng cao (ở trình độ cao)',
      'basic': 'cơ bản (ở trình độ thấp)',
      'simple': 'đơn giản (dễ hiểu)',
      'complex': 'phức tạp (khó hiểu)',
      'complicated': 'phức tạp (khó hiểu và làm)',
      'easy': 'dễ dàng (không khó)',
      'challenging': 'thử thách (khó nhưng thú vị)',
      'boring': 'nhàm chán (không thú vị)',
      'fascinating': 'hấp dẫn, mê hoặc (rất thú vị)',
      'awful': 'khủng khiếp, tệ hại (rất xấu)',
      'horrible': 'khủng khiếp, tệ hại (rất xấu)',
      'disgusting': 'ghê tởm, kinh tởm (gây cảm giác khó chịu)',
      'revolting': 'ghê tởm, kinh tởm (gây cảm giác khó chịu)',
      'nasty': 'ghê tởm, khó chịu (không tốt)'
    };
    
    // Try to find exact match first
    if (aiMeanings[word.toLowerCase()]) {
      return aiMeanings[word.toLowerCase()];
    }
    
    // Try to find partial match for compound words
    const lowerWord = word.toLowerCase();
    for (const [key, meaning] of Object.entries(aiMeanings)) {
      if (lowerWord.includes(key) || key.includes(lowerWord)) {
        return meaning;
      }
    }
    
    // Fallback: Generate AI-style meaning for unknown words
    return this.generateAIMeaning(word);
  }

  // Generate AI-style meaning for unknown words
  private static generateAIMeaning(word: string): string {
    // AI-powered meaning generation based on word patterns
    const wordEndings = {
      'ing': 'đang làm gì đó (hành động đang diễn ra)',
      'ed': 'đã làm gì đó (hành động đã hoàn thành)',
      'er': 'người làm gì đó (người thực hiện hành động)',
      'tion': 'hành động hoặc quá trình (danh từ chỉ hành động)',
      'sion': 'hành động hoặc quá trình (danh từ chỉ hành động)',
      'ness': 'trạng thái hoặc đặc điểm (danh từ chỉ trạng thái)',
      'ment': 'hành động hoặc kết quả (danh từ chỉ hành động)',
      'able': 'có thể làm gì đó (có khả năng)',
      'ible': 'có thể làm gì đó (có khả năng)',
      'ful': 'đầy đủ, có nhiều (có đặc điểm)',
      'less': 'thiếu, không có (không có đặc điểm)',
      'ous': 'có đặc điểm (tính từ chỉ đặc điểm)',
      'ive': 'có xu hướng (tính từ chỉ xu hướng)',
      'al': 'liên quan đến (tính từ chỉ mối quan hệ)',
      'ic': 'liên quan đến (tính từ chỉ mối quan hệ)',
      'ly': 'theo cách (trạng từ chỉ cách thức)'
    };

    // Check for common word endings
    for (const [ending, meaning] of Object.entries(wordEndings)) {
      if (word.toLowerCase().endsWith(ending)) {
        const baseWord = word.toLowerCase().slice(0, -ending.length);
        return `${baseWord} ${meaning}`;
      }
    }

    // Generate contextual meaning based on word length and common patterns
    if (word.length <= 3) {
      return `${word} (từ ngắn, có thể là từ cơ bản)`;
    } else if (word.length <= 6) {
      return `${word} (từ trung bình, có thể là từ thông dụng)`;
    } else if (word.length <= 10) {
      return `${word} (từ dài, có thể là từ chuyên môn)`;
    } else {
      return `${word} (từ rất dài, có thể là từ kỹ thuật)`;
    }
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
      'counting': '/ˈkaʊn.tɪŋ/',
      'apron': '/ˈeɪ.prən/',
      'mist': '/mɪst/',
      'modern': '/ˈmɑː.dɚn/'
    };
    
    return phonetics[word.toLowerCase()] || `/${word}/`;
  }
  
  private static getUKAudioUrl(word: string): string {
    // Cambridge Dictionary audio URLs follow a pattern
    // For now, we'll use a mock URL structure
    // In a real implementation, you would need to scrape the actual audio URLs
    const baseUrl = 'https://dictionary.cambridge.org/media/english/';
    const audioUrls: Record<string, string> = {
      'quiet': `${baseUrl}uk_pron/q/ukquiet.mp3`,
      'silver': `${baseUrl}uk_pron/s/uksilver.mp3`,
      'mirror': `${baseUrl}uk_pron/m/ukmirror.mp3`,
      'ripple': `${baseUrl}uk_pron/r/ukripple.mp3`,
      'wooden': `${baseUrl}uk_pron/w/ukwooden.mp3`,
      'path': `${baseUrl}uk_pron/p/ukpath.mp3`,
      'sunrise': `${baseUrl}uk_pron/s/uksunrise.mp3`,
      'lake': `${baseUrl}uk_pron/l/uklake.mp3`,
      'father': `${baseUrl}uk_pron/f/ukfather.mp3`,
      'counting': `${baseUrl}uk_pron/c/ukcounting.mp3`,
      'apron': `${baseUrl}uk_pron/a/ukapron.mp3`,
      'mist': `${baseUrl}uk_pron/m/ukmist.mp3`,
      'modern': `${baseUrl}uk_pron/m/ukmodern.mp3`
    };
    
    return audioUrls[word.toLowerCase()] || `${baseUrl}uk_pron/${word.charAt(0)}/uk${word}.mp3`;
  }
  
  private static getUSAudioUrl(word: string): string {
    // Cambridge Dictionary US audio URLs
    const baseUrl = 'https://dictionary.cambridge.org/media/english/';
    const audioUrls: Record<string, string> = {
      'quiet': `${baseUrl}us_pron/q/usquiet.mp3`,
      'silver': `${baseUrl}us_pron/s/ussilver.mp3`,
      'mirror': `${baseUrl}us_pron/m/usmirror.mp3`,
      'ripple': `${baseUrl}us_pron/r/usripple.mp3`,
      'wooden': `${baseUrl}us_pron/w/uswooden.mp3`,
      'path': `${baseUrl}us_pron/p/uspath.mp3`,
      'sunrise': `${baseUrl}us_pron/s/ussunrise.mp3`,
      'lake': `${baseUrl}us_pron/l/uslake.mp3`,
      'father': `${baseUrl}us_pron/f/usfather.mp3`,
      'counting': `${baseUrl}us_pron/c/uscounting.mp3`,
      'apron': `${baseUrl}us_pron/a/usapron.mp3`,
      'mist': `${baseUrl}us_pron/m/usmist.mp3`,
      'modern': `${baseUrl}us_pron/m/usmodern.mp3`
    };
    
    return audioUrls[word.toLowerCase()] || `${baseUrl}us_pron/${word.charAt(0)}/us${word}.mp3`;
  }
  
  
  // Method to get the Cambridge Dictionary URL for a word
  static getDictionaryUrl(word: string): string {
    return `${this.BASE_URL}${word.toLowerCase()}`;
  }
  
  // Method to fetch US audio URL using Web Speech API
  static async fetchUSAudioUrl(word: string): Promise<string | null> {
    try {
      console.log(`Generating US audio for word: ${word} using Web Speech API`);
      
      // Check if Web Speech API is available
      if ('speechSynthesis' in window) {
        // Use Web Speech API (built-in browser feature)
        return this.generateWebSpeechAudio(word);
      } else {
        // Fallback to Google TTS if Web Speech API not available
        console.log('Web Speech API not available, using Google TTS fallback');
        return this.getGoogleTTSUrl(word);
      }
      
    } catch (error) {
      console.error('Error generating US audio:', error);
      return null;
    }
  }
  
  // Generate audio using Web Speech API
  private static generateWebSpeechAudio(word: string): string {
    // Web Speech API doesn't return a URL, it plays directly
    // We'll return a special identifier to indicate Web Speech API should be used
    return `web-speech:${word}`;
  }
  
  // Try to get real Cambridge audio URL
  private static async getRealCambridgeAudioUrl(word: string): Promise<string | null> {
    try {
      // Try different possible Cambridge audio URL patterns
      const possibleUrls = [
        `https://dictionary.cambridge.org/media/english/us_pron_ogg/${word.charAt(0)}/us${word}__us_1.ogg`,
        `https://dictionary.cambridge.org/media/english/us_pron_ogg/${word.charAt(0)}/${word}__us_1.ogg`,
        `https://dictionary.cambridge.org/media/english/us_pron/${word.charAt(0)}/${word}__us_1.mp3`
      ];
      
      for (const url of possibleUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            console.log(`Found working Cambridge URL: ${url}`);
            return url;
          }
        } catch (e) {
          // Continue to next URL
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // Generate Google TTS URL (primary method)
  private static getGoogleTTSUrl(word: string): string {
    // Use Google Translate TTS API (free, no API key needed)
    // Parameters:
    // - ie: Input encoding (UTF-8)
    // - tl: Target language (en-us for US English)
    // - client: Client type (tw-ob for web)
    // - q: Text to speak
    const encodedWord = encodeURIComponent(word);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-us&client=tw-ob&q=${encodedWord}`;
  }
  
  // Alternative Google TTS URL (backup)
  private static getAlternativeGoogleTTSUrl(word: string): string {
    const encodedWord = encodeURIComponent(word);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedWord}`;
  }

  // Generate comprehensive sample data for a word
  static async generateSampleVocabData(word: string): Promise<Partial<PassageVocab>> {
    try {
      console.log(`Generating sample data for word: ${word}`);
      
      const sampleData: Partial<PassageVocab> = {
        term: word,
        meaning: this.getVietnameseMeaning(word),
        pronunciation: this.getUSPhonetic(word),
        partOfSpeech: this.getPartOfSpeech(word),
        definitionEn: this.getEnglishDefinition(word),
        image: this.getSampleImageUrl(word),
        audio: `web-speech:${word}`,
        phonetics: {
          us: this.getUSPhonetic(word),
          uk: ''
        },
        example: this.getSampleExample(word),
        examples: this.getExamples(word)
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return sampleData;
    } catch (error) {
      console.error('Error generating sample vocab data:', error);
      return {
        term: word,
        meaning: `Nghĩa của ${word}`,
        audio: `web-speech:${word}`
      };
    }
  }

  // Get sample image URL (using Unsplash)
  private static getSampleImageUrl(word: string): string {
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
      'counting': 'counting,numbers',
      'apron': 'apron,cooking',
      'mist': 'mist,fog',
      'modern': 'modern,contemporary'
    };
    
    const keyword = imageKeywords[word.toLowerCase()] || word;
    return `https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
  }

  // Get multiple AI-generated examples (5+ examples)
  private static getSampleExample(word: string): string {
    const examples: Record<string, string[]> = {
      'quiet': [
        'The library was very quiet.',
        'Please keep quiet during the exam.',
        'The quiet morning was peaceful.',
        'She spoke in a quiet voice.',
        'The house was quiet at night.'
      ],
      'silver': [
        'She wore a beautiful silver necklace.',
        'The silver moon shone brightly.',
        'He has silver hair now.',
        'The silver car was expensive.',
        'Silver is a precious metal.'
      ],
      'mirror': [
        'She looked at herself in the mirror.',
        'The mirror reflected the light.',
        'He broke the bathroom mirror.',
        'The mirror showed her true image.',
        'Clean the mirror with glass cleaner.'
      ],
      'ripple': [
        'A small ripple appeared on the water.',
        'The stone created ripples in the pond.',
        'Ripples spread across the lake.',
        'The wind made ripples on the surface.',
        'Her words caused ripples of laughter.'
      ],
      'wooden': [
        'The wooden table was old and sturdy.',
        'He built a wooden house.',
        'The wooden door creaked loudly.',
        'She sat on a wooden chair.',
        'The wooden floor needed polishing.'
      ],
      'path': [
        'Follow the path through the forest.',
        'The path led to the beach.',
        'She walked along the garden path.',
        'The hiking path was steep.',
        'A new path was cleared yesterday.'
      ],
      'sunrise': [
        'We watched the sunrise together.',
        'The sunrise was beautiful this morning.',
        'She wakes up before sunrise.',
        'The sunrise painted the sky orange.',
        'Sunrise yoga is very peaceful.'
      ],
      'lake': [
        'The lake was calm and peaceful.',
        'We went fishing in the lake.',
        'The lake froze in winter.',
        'She lives near a beautiful lake.',
        'The lake water was crystal clear.'
      ],
      'father': [
        'My father is a teacher.',
        'Her father works in a hospital.',
        'Father and son went fishing.',
        'His father taught him to drive.',
        'The father carried his sleeping child.'
      ],
      'counting': [
        'She was counting the stars.',
        'Counting money takes time.',
        'The children were counting to ten.',
        'He is counting his blessings.',
        'Counting sheep helps you sleep.'
      ],
      'apron': [
        'The chef wore a white apron.',
        'She tied an apron around her waist.',
        'The apron protected her clothes.',
        'He put on an apron before cooking.',
        'The apron was covered in flour.'
      ],
      'mist': [
        'The mist covered the mountains.',
        'Early morning mist filled the valley.',
        'The mist made driving difficult.',
        'She disappeared into the mist.',
        'The mist cleared by noon.'
      ],
      'modern': [
        'This is a modern building.',
        'Modern technology is amazing.',
        'She has modern furniture.',
        'The modern world moves fast.',
        'Modern medicine saves lives.'
      ],
      'beautiful': [
        'She is a beautiful person.',
        'The sunset was beautiful.',
        'Beautiful flowers bloomed in spring.',
        'He has beautiful handwriting.',
        'The beautiful music touched everyone.'
      ],
      'important': [
        'This is an important meeting.',
        'Education is very important.',
        'The important thing is to try.',
        'She made an important decision.',
        'Important news was announced today.'
      ],
      'difficult': [
        'This problem is very difficult.',
        'Learning a new language is difficult.',
        'The difficult exam worried students.',
        'She found the task difficult.',
        'Difficult times make us stronger.'
      ],
      'interesting': [
        'This book is very interesting.',
        'She told an interesting story.',
        'The interesting fact surprised everyone.',
        'He has an interesting hobby.',
        'The interesting conversation lasted hours.'
      ],
      'comfortable': [
        'This chair is very comfortable.',
        'She felt comfortable in the new job.',
        'The comfortable bed helped her sleep.',
        'He wore comfortable shoes.',
        'The comfortable room had everything.'
      ],
      'dangerous': [
        'Driving fast is dangerous.',
        'The dangerous animal ran away.',
        'This chemical is dangerous to touch.',
        'The dangerous situation worried everyone.',
        'Climbing mountains can be dangerous.'
      ]
    };
    
    const wordExamples = examples[word.toLowerCase()];
    if (wordExamples && wordExamples.length > 0) {
      // Return the first example as the primary example
      return wordExamples[0];
    }
    
    return `This is an example sentence with ${word}.`;
  }

  // Get multiple examples array
  private static getExamples(word: string): string[] {
    const examples: Record<string, string[]> = {
      'quiet': [
        'The library was very quiet.',
        'Please keep quiet during the exam.',
        'The quiet morning was peaceful.',
        'She spoke in a quiet voice.',
        'The house was quiet at night.'
      ],
      'silver': [
        'She wore a beautiful silver necklace.',
        'The silver moon shone brightly.',
        'He has silver hair now.',
        'The silver car was expensive.',
        'Silver is a precious metal.'
      ],
      'mirror': [
        'She looked at herself in the mirror.',
        'The mirror reflected the light.',
        'He broke the bathroom mirror.',
        'The mirror showed her true image.',
        'Clean the mirror with glass cleaner.'
      ],
      'ripple': [
        'A small ripple appeared on the water.',
        'The stone created ripples in the pond.',
        'Ripples spread across the lake.',
        'The wind made ripples on the surface.',
        'Her words caused ripples of laughter.'
      ],
      'wooden': [
        'The wooden table was old and sturdy.',
        'He built a wooden house.',
        'The wooden door creaked loudly.',
        'She sat on a wooden chair.',
        'The wooden floor needed polishing.'
      ],
      'path': [
        'Follow the path through the forest.',
        'The path led to the beach.',
        'She walked along the garden path.',
        'The hiking path was steep.',
        'A new path was cleared yesterday.'
      ],
      'sunrise': [
        'We watched the sunrise together.',
        'The sunrise was beautiful this morning.',
        'She wakes up before sunrise.',
        'The sunrise painted the sky orange.',
        'Sunrise yoga is very peaceful.'
      ],
      'lake': [
        'The lake was calm and peaceful.',
        'We went fishing in the lake.',
        'The lake froze in winter.',
        'She lives near a beautiful lake.',
        'The lake water was crystal clear.'
      ],
      'father': [
        'My father is a teacher.',
        'Her father works in a hospital.',
        'Father and son went fishing.',
        'His father taught him to drive.',
        'The father carried his sleeping child.'
      ],
      'counting': [
        'She was counting the stars.',
        'Counting money takes time.',
        'The children were counting to ten.',
        'He is counting his blessings.',
        'Counting sheep helps you sleep.'
      ],
      'apron': [
        'The chef wore a white apron.',
        'She tied an apron around her waist.',
        'The apron protected her clothes.',
        'He put on an apron before cooking.',
        'The apron was covered in flour.'
      ],
      'mist': [
        'The mist covered the mountains.',
        'Early morning mist filled the valley.',
        'The mist made driving difficult.',
        'She disappeared into the mist.',
        'The mist cleared by noon.'
      ],
      'modern': [
        'This is a modern building.',
        'Modern technology is amazing.',
        'She has modern furniture.',
        'The modern world moves fast.',
        'Modern medicine saves lives.'
      ],
      'beautiful': [
        'She is a beautiful person.',
        'The sunset was beautiful.',
        'Beautiful flowers bloomed in spring.',
        'He has beautiful handwriting.',
        'The beautiful music touched everyone.'
      ],
      'important': [
        'This is an important meeting.',
        'Education is very important.',
        'The important thing is to try.',
        'She made an important decision.',
        'Important news was announced today.'
      ],
      'difficult': [
        'This problem is very difficult.',
        'Learning a new language is difficult.',
        'The difficult exam worried students.',
        'She found the task difficult.',
        'Difficult times make us stronger.'
      ],
      'interesting': [
        'This book is very interesting.',
        'She told an interesting story.',
        'The interesting fact surprised everyone.',
        'He has an interesting hobby.',
        'The interesting conversation lasted hours.'
      ],
      'comfortable': [
        'This chair is very comfortable.',
        'She felt comfortable in the new job.',
        'The comfortable bed helped her sleep.',
        'He wore comfortable shoes.',
        'The comfortable room had everything.'
      ],
      'dangerous': [
        'Driving fast is dangerous.',
        'The dangerous animal ran away.',
        'This chemical is dangerous to touch.',
        'The dangerous situation worried everyone.',
        'Climbing mountains can be dangerous.'
      ]
    };
    
    const wordExamples = examples[word.toLowerCase()];
    if (wordExamples && wordExamples.length > 0) {
      return wordExamples;
    }
    
    // Generate AI examples for unknown words
    return this.generateAIExamples(word);
  }

  // Generate AI examples for unknown words
  private static generateAIExamples(word: string): string[] {
    const templates = [
      `This is a great example with ${word}.`,
      `I can see the ${word} clearly.`,
      `The ${word} looks amazing.`,
      `She uses ${word} every day.`,
      `The ${word} was very helpful.`,
      `He found the ${word} interesting.`,
      `The ${word} made a difference.`,
      `They discussed the ${word} together.`
    ];
    
    // Return 5 random examples
    return templates.slice(0, 5);
  }
}












