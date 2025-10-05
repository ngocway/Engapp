// Service để gọi AI API cho phiên âm tiếng Việt
export class PronunciationService {
  // Mock function - trong thực tế sẽ gọi AI API thật
  static async generateVietnamesePronunciation(word: string, meaning: string): Promise<string> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI logic - trong thực tế sẽ gọi OpenAI, Claude, hoặc AI service khác
      const mockPronunciations: Record<string, string> = {
        'mist': 'mít',
        'thermos': 'thơ-mót',
        'heron': 'he-rơn',
        'reeds': 'rít',
        'wetland': 'wet-len',
        'reflection': 'ri-phéc-sơn',
        'dock': 'đốc',
        'habitat': 'ha-bi-tát',
        'morning': 'mỏ-ning',
        'lake': 'lây-k',
        'water': 'o-tơ',
        'bird': 'bớt',
        'tree': 'tri',
        'flower': 'flao-ơ',
        'mountain': 'mao-tơn',
        'river': 'ri-vơ',
        'forest': 'fo-rét',
        'ocean': 'ô-sơn',
        'sun': 'san',
        'moon': 'mun',
        'star': 'xta',
        'cloud': 'clao',
        'rain': 'rên',
        'snow': 'snô',
        'wind': 'win',
        'fire': 'fai-ơ',
        'earth': 'ớt',
        'sky': 'skai',
        'ground': 'grao',
        'rock': 'rốc',
        'sand': 'sen',
        'grass': 'gra-x',
        'leaf': 'líp',
        'root': 'rút',
        'branch': 'brên',
        'seed': 'sít',
        'fruit': 'frút',
        'vegetable': 've-gi-tơ-bồ',
        'animal': 'e-ni-mồ',
        'cat': 'két',
        'dog': 'đốc',
        'fish': 'phít',
        'horse': 'hót',
        'cow': 'cao',
        'pig': 'píg',
        'chicken': 'chí-kên',
        'duck': 'đắc',
        'butterfly': 'bá-tơ-flai',
        'bee': 'bi',
        'spider': 'spai-đơ',
        'ant': 'en',
        'fly': 'flai',
        'mosquito': 'mót-kí-tô',
        'house': 'hao',
        'door': 'đô',
        'window': 'win-đô',
        'room': 'rum',
        'kitchen': 'kí-chên',
        'bedroom': 'bét-rum',
        'bathroom': 'bát-rum',
        'living room': 'li-vinh rum',
        'table': 'tê-bồ',
        'chair': 'ché',
        'bed': 'bét',
        'book': 'búc',
        'pen': 'pen',
        'pencil': 'pen-sồ',
        'paper': 'pê-pơ',
        'computer': 'com-píu-tơ',
        'phone': 'fôn',
        'television': 'te-lí-vi-sơn',
        'radio': 'rê-đi-ô',
        'car': 'ca',
        'bus': 'bát',
        'train': 'trên',
        'plane': 'plên',
        'ship': 'síp',
        'bicycle': 'bai-sí-cồ',
        'motorcycle': 'mô-tơ-sai-cồ',
        'food': 'fút',
        'milk': 'míl',
        'bread': 'brét',
        'rice': 'rai',
        'meat': 'mít',
        'apple': 'e-pồ',
        'banana': 'ba-na-na',
        'orange': 'ô-ren',
        'grape': 'grép',
        'strawberry': 'xtrô-be-ri',
        'red': 'rét',
        'blue': 'blu',
        'green': 'grin',
        'yellow': 'ye-lô',
        'black': 'blék',
        'white': 'wait',
        'brown': 'brao',
        'pink': 'pink',
        'purple': 'pớ-pồ',
        'gray': 'gré',
        'big': 'bíg',
        'small': 'smol',
        'tall': 'tol',
        'short': 'sót',
        'long': 'long',
        'wide': 'waid',
        'narrow': 'ne-rô',
        'thick': 'thík',
        'thin': 'thin',
        'heavy': 'he-vi',
        'light': 'lait',
        'fast': 'fát',
        'slow': 'slô',
        'hot': 'hót',
        'cold': 'côl',
        'warm': 'wom',
        'cool': 'cul',
        'dry': 'drai',
        'wet': 'wet',
        'clean': 'clin',
        'dirty': 'dớ-ti',
        'new': 'niu',
        'old': 'ôl',
        'good': 'gút',
        'bad': 'bét',
        'beautiful': 'biu-ti-ful',
        'ugly': 'ág-li',
        'happy': 'he-pi',
        'sad': 'sét',
        'angry': 'eng-gri',
        'tired': 'tai-ơ',
        'hungry': 'háng-gri',
        'thirsty': 'thớ-ti',
        'sleepy': 'slí-pi',
        'one': 'wăn',
        'two': 'tu',
        'three': 'thri',
        'four': 'fo',
        'five': 'faiv',
        'six': 'síks',
        'seven': 'se-vên',
        'eight': 'ét',
        'nine': 'nain',
        'ten': 'ten'
      };
      
      // Tìm phiên âm có sẵn
      const lowerWord = word.toLowerCase().trim();
      if (mockPronunciations[lowerWord]) {
        return mockPronunciations[lowerWord];
      }
      
      // Logic đơn giản để tạo phiên âm từ chữ cái
      let pronunciation = '';
      for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();
        switch (char) {
          case 'a': pronunciation += 'e'; break;
          case 'b': pronunciation += 'b'; break;
          case 'c': pronunciation += 'k'; break;
          case 'd': pronunciation += 'đ'; break;
          case 'e': pronunciation += 'i'; break;
          case 'f': pronunciation += 'ph'; break;
          case 'g': pronunciation += 'g'; break;
          case 'h': pronunciation += 'h'; break;
          case 'i': pronunciation += 'ai'; break;
          case 'j': pronunciation += 'j'; break;
          case 'k': pronunciation += 'k'; break;
          case 'l': pronunciation += 'l'; break;
          case 'm': pronunciation += 'm'; break;
          case 'n': pronunciation += 'n'; break;
          case 'o': pronunciation += 'ô'; break;
          case 'p': pronunciation += 'p'; break;
          case 'q': pronunciation += 'k'; break;
          case 'r': pronunciation += 'r'; break;
          case 's': pronunciation += 'x'; break;
          case 't': pronunciation += 't'; break;
          case 'u': pronunciation += 'u'; break;
          case 'v': pronunciation += 'v'; break;
          case 'w': pronunciation += 'w'; break;
          case 'x': pronunciation += 'ks'; break;
          case 'y': pronunciation += 'i'; break;
          case 'z': pronunciation += 'z'; break;
          default: pronunciation += char; break;
        }
      }
      
      return pronunciation.toLowerCase();
    } catch (error) {
      console.error('Error generating Vietnamese pronunciation:', error);
      throw new Error('Không thể tạo phiên âm tiếng Việt');
    }
  }
  
  // Function để gọi AI API thật (OpenAI, Claude, etc.)
  static async generateVietnamesePronunciationWithAI(word: string, meaning: string): Promise<string> {
    try {
      // Trong thực tế, đây sẽ là API call đến OpenAI hoặc Claude
      // const response = await fetch('/api/generate-pronunciation', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     word: word,
      //     meaning: meaning,
      //     prompt: `Hãy tạo phiên âm tiếng Việt cho từ "${word}" (nghĩa: ${meaning}). Chỉ trả về phiên âm, không giải thích.`
      //   })
      // });
      // const data = await response.json();
      // return data.pronunciation;
      
      // Tạm thời dùng mock function
      return this.generateVietnamesePronunciation(word, meaning);
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Lỗi khi gọi AI API');
    }
  }
}
