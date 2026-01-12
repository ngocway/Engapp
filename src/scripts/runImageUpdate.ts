import { updateVocabularyImages } from './updateVocabularyImages';

// Script để chạy cập nhật ảnh từ vựng
const runImageUpdate = async () => {
  console.log('🚀 Bắt đầu chạy script cập nhật ảnh từ vựng...');
  
  try {
    await updateVocabularyImages();
    console.log('✅ Script hoàn thành thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi chạy script:', error);
  }
};

// Export để có thể gọi từ browser console
export { runImageUpdate };

// Chạy script nếu được gọi trực tiếp
if (typeof window !== 'undefined') {
  (window as any).runImageUpdate = runImageUpdate;
  console.log('💡 Để chạy script, gõ: runImageUpdate() trong browser console');
}


