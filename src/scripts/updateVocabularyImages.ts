import { passageService } from '../firebase/passageService';

// Mapping từ vựng với ảnh Unsplash phù hợp
const vocabularyImageMap: { [key: string]: string } = {
  // Nature & Environment
  'biodiversity': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'wildlife': 'https://images.unsplash.com/photo-1544966503-7cc4ac7c0b0b?w=400&h=300&fit=crop',
  'humidity': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'habitat': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'species': 'https://images.unsplash.com/photo-1544966503-7cc4ac7c0b0b?w=400&h=300&fit=crop',
  'precipitation': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'environment': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'temperature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'plants': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'flowers': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'stream': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'water': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'fish': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
  'pond': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'air': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  
  // Daily Life
  'wake up': 'https://images.unsplash.com/photo-1541781774459-67154406157c?w=400&h=300&fit=crop',
  'breakfast': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
  'homework': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  
  // Animals
  'fluffy': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  'meowing': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  'purr': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  
  // Weather
  'floating': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'blooming': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'picnic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  
  // Basic vocabulary
  'cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  'dog': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'book': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
  'pencil': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
  'sun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'rain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
};

// Script để cập nhật ảnh cho từ vựng
export const updateVocabularyImages = async () => {
  console.log('🖼️ Bắt đầu cập nhật ảnh cho từ vựng...');
  
  try {
    // Lấy tất cả passages
    const passages = await passageService.getAll();
    console.log(`📚 Tìm thấy ${passages.length} passages`);
    
    let updatedCount = 0;
    
    for (const passage of passages) {
      if (passage.vocab && passage.vocab.length > 0) {
        console.log(`📖 Đang xử lý passage: ${passage.title}`);
        
        // Cập nhật ảnh cho từng từ vựng
        const updatedVocab = passage.vocab.map(vocab => {
          const imageUrl = vocabularyImageMap[vocab.term.toLowerCase()];
          if (imageUrl) {
            console.log(`  ✅ Thêm ảnh cho từ: ${vocab.term}`);
            return {
              ...vocab,
              image: imageUrl
            };
          } else {
            console.log(`  ⚠️ Không tìm thấy ảnh cho từ: ${vocab.term}`);
            return vocab;
          }
        });
        
        // Cập nhật passage với vocab mới
        const updatedPassage = {
          ...passage,
          vocab: updatedVocab
        };
        
        // Lưu lại passage đã cập nhật
        await passageService.update(passage.id, updatedPassage);
        updatedCount++;
        console.log(`✅ Đã cập nhật passage: ${passage.title}`);
      }
    }
    
    console.log(`🎉 Hoàn thành! Đã cập nhật ${updatedCount} passages với ảnh từ vựng.`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật ảnh từ vựng:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (typeof window !== 'undefined') {
  (window as any).updateVocabularyImages = updateVocabularyImages;
}


