import { vocabularyData } from '../data/vocabulary';
import { vocabularyService } from '../firebase/vocabularyService';

// Script để upload dữ liệu mẫu lên Firebase
export const uploadSampleData = async () => {
  console.log('🚀 Bắt đầu upload dữ liệu mẫu lên Firebase...');
  
  try {
    // Upload từ vựng
    for (const word of vocabularyData) {
      const { id, ...wordData } = word;
      const docId = await vocabularyService.addVocabulary(wordData);
      
      if (docId) {
        console.log(`✅ Đã upload từ: ${word.word} với ID: ${docId}`);
      } else {
        console.error(`❌ Lỗi khi upload từ: ${word.word}`);
      }
    }
    
    console.log('🎉 Hoàn thành upload dữ liệu mẫu!');
  } catch (error) {
    console.error('❌ Lỗi khi upload dữ liệu:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (typeof window !== 'undefined') {
  // Chỉ chạy trong browser
  (window as any).uploadSampleData = uploadSampleData;
}




























