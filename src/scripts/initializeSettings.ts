import { settingsService } from '../firebase/settingsService';

/**
 * Script để khởi tạo dữ liệu mặc định cho settings
 * Chạy script này một lần để tạo các collections và dữ liệu ban đầu
 */
export const initializeSettings = async () => {
  console.log('🚀 Starting settings initialization...');
  
  try {
    await settingsService.initializeDefaultSettings();
    console.log('✅ Settings initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Settings initialization failed:', error);
    return false;
  }
};

// Auto-run if this script is executed directly
if (typeof window === 'undefined') {
  // Running in Node.js environment
  initializeSettings().then(success => {
    if (success) {
      console.log('🎉 Settings are ready to use!');
      process.exit(0);
    } else {
      console.log('💥 Settings initialization failed!');
      process.exit(1);
    }
  });
}
