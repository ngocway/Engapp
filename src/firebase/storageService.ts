import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class StorageService {
  /**
   * Upload file lên Firebase Storage
   * @param file File cần upload
   * @param path Đường dẫn trong storage (ví dụ: 'vocab/images/', 'vocab/audio/')
   * @param filename Tên file (nếu không có sẽ dùng tên file gốc)
   * @returns Promise<UploadResult>
   */
  static async uploadFile(
    file: File, 
    path: string, 
    filename?: string
  ): Promise<UploadResult> {
    try {
      // Tạo tên file unique với timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const finalFilename = filename || `${timestamp}_${file.name}`;
      const fullPath = `${path}${finalFilename}`;

      // Tạo reference đến storage
      const storageRef = ref(storage, fullPath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Lấy download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ File uploaded successfully: ${fullPath}`);
      console.log(`🔗 Download URL: ${downloadURL}`);

      return {
        success: true,
        url: downloadURL
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload ảnh từ vựng
   */
  static async uploadVocabImage(file: File, vocabTerm: string): Promise<UploadResult> {
    const sanitizedTerm = vocabTerm.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${sanitizedTerm}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, 'vocab/images/', filename);
  }

  /**
   * Upload audio từ vựng
   */
  static async uploadVocabAudio(file: File, vocabTerm: string): Promise<UploadResult> {
    const sanitizedTerm = vocabTerm.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${sanitizedTerm}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, 'vocab/audio/', filename);
  }

  /**
   * Xóa file từ Firebase Storage
   * @param url Download URL của file cần xóa
   */
  static async deleteFile(url: string): Promise<boolean> {
    try {
      // Tạo reference từ URL
      const storageRef = ref(storage, url);
      
      // Xóa file
      await deleteObject(storageRef);
      
      console.log(`✅ File deleted successfully: ${url}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }
  }

  /**
   * Validate file type và size
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ hỗ trợ file ảnh: JPG, PNG, GIF, WEBP'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Kích thước file không được vượt quá 5MB'
      };
    }

    return { valid: true };
  }

  static validateAudioFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/m4a'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ hỗ trợ file audio: MP3, WAV, OGG, M4A'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Kích thước file không được vượt quá 10MB'
      };
    }

    return { valid: true };
  }
}

export default StorageService;
