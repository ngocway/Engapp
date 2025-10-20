import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PASSAGES_COLLECTION = 'passages';

/**
 * Script để cập nhật tất cả passages với lessonType và accessType mới
 */
export const updateAllPassages = async () => {
  try {
    console.log('🚀 Bắt đầu cập nhật tất cả passages...');
    
    // Lấy tất cả documents trong collection passages
    const passagesSnapshot = await getDocs(collection(db, PASSAGES_COLLECTION));
    
    if (passagesSnapshot.empty) {
      console.log('⚠️ Không tìm thấy passage nào trong database');
      return;
    }
    
    console.log(`📊 Tìm thấy ${passagesSnapshot.size} passages để cập nhật`);
    
    const updatePromises = passagesSnapshot.docs.map(async (docSnapshot) => {
      const docId = docSnapshot.id;
      const passageData = docSnapshot.data();
      
      console.log(`🔄 Đang cập nhật passage: "${passageData.title}" (ID: ${docId})`);
      
      // Cập nhật với lessonType và accessType mới
      const updateData = {
        lessonType: 'passage', // Đoạn văn
        accessType: 'free'     // Miễn phí
      };
      
      try {
        await updateDoc(doc(db, PASSAGES_COLLECTION, docId), updateData);
        console.log(`✅ Đã cập nhật passage: "${passageData.title}"`);
        return { success: true, title: passageData.title, id: docId };
      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật passage: "${passageData.title}"`, error);
        return { success: false, title: passageData.title, id: docId, error };
      }
    });
    
    // Chờ tất cả updates hoàn thành
    const results = await Promise.all(updatePromises);
    
    // Thống kê kết quả
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('📈 Kết quả cập nhật:');
    console.log(`✅ Thành công: ${successful.length} passages`);
    console.log(`❌ Thất bại: ${failed.length} passages`);
    
    if (failed.length > 0) {
      console.log('❌ Danh sách passages thất bại:');
      failed.forEach(f => {
        console.log(`  - "${f.title}" (ID: ${f.id}): ${f.error}`);
      });
    }
    
    if (successful.length > 0) {
      console.log('✅ Danh sách passages đã cập nhật thành công:');
      successful.forEach(s => {
        console.log(`  - "${s.title}" (ID: ${s.id})`);
      });
    }
    
    console.log('🎉 Hoàn thành cập nhật tất cả passages!');
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật passages:', error);
    throw error;
  }
};

// Hàm để chạy script từ console
export const runUpdateScript = async () => {
  try {
    await updateAllPassages();
    console.log('✅ Script đã chạy thành công!');
  } catch (error) {
    console.error('❌ Script thất bại:', error);
  }
};
