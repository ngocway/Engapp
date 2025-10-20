import { passageService } from '../firebase/passageService';
import { topicService } from '../firebase/topicService';

// Script để cập nhật accessType cho các passages hiện có
export const updatePassageAccessType = async () => {
  console.log('🚀 Bắt đầu cập nhật accessType cho passages...');
  
  try {
    // Lấy tất cả topics
    const topics = await topicService.getAll();
    console.log(`📚 Tìm thấy ${topics.length} topics`);
    
    let updatedCount = 0;
    
    for (const topic of topics) {
      if (topic.slug) {
        console.log(`\n🔍 Đang xử lý topic: ${topic.name} (${topic.slug})`);
        
        // Lấy tất cả passages của topic này
        const passages = await passageService.getByTopicSlug(topic.slug);
        console.log(`📖 Tìm thấy ${passages.length} passages`);
        
        for (let i = 0; i < passages.length; i++) {
          const passage = passages[i];
          
          // Chỉ cập nhật nếu chưa có accessType
          if (!passage.accessType) {
            // Quy tắc: 70% free, 30% premium
            // Hoặc có thể dựa vào level: basic = free, advanced = premium
            const isPremium = Math.random() < 0.3; // 30% chance là premium
            const accessType = isPremium ? 'premium' : 'free';
            
            // Cập nhật passage với accessType
            await passageService.update(passage.id, { accessType });
            
            console.log(`✅ Cập nhật passage "${passage.title}": ${accessType}`);
            updatedCount++;
          } else {
            console.log(`⏭️ Passage "${passage.title}" đã có accessType: ${passage.accessType}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount} passages`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật accessType:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (typeof window !== 'undefined') {
  (window as any).updatePassageAccessType = updatePassageAccessType;
}
