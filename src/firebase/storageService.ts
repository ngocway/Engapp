import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @returns An object containing downloadURL and publicURL, or null if an error occurs.
 */
export const uploadImageToStorage = async (file: File): Promise<{ downloadURL: string; publicURL: string } | null> => {
  try {
    const fileName = `passages/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    const publicURL = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(fileName)}?alt=media`;

    console.log('🔗 Authenticated URL:', downloadURL);
    console.log('🌐 Public URL:', publicURL);

    return { downloadURL, publicURL };
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Deletes an image from Firebase Storage.
 * @param imageUrl The full URL of the image to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Firebase Storage URLs can be in two main formats:
    // 1. Authenticated: https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/path%2Fto%2Ffile?alt=media&token=YOUR_TOKEN
    // 2. Public: https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/path%2Fto%2Ffile?alt=media
    // We need to extract the 'path/to/file' part.

    const url = new URL(imageUrl);
    const pathWithEncodedSlashes = url.pathname.split('/o/')[1]; // Get 'path%2Fto%2Ffile'
    const filePath = decodeURIComponent(pathWithEncodedSlashes.split('?')[0]); // Decode and remove query params

    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
    console.log('✅ Image deleted from storage:', imageUrl);
    return true;
  } catch (error) {
    console.error('❌ Error deleting image from storage:', imageUrl, error);
    return false;
  }
};

/**
 * Validates image file
 * @param file The file to validate
 * @returns Validation result with success status and error message
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ hỗ trợ file ảnh: JPG, PNG, GIF, WebP' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước file không được vượt quá 5MB' };
  }

  return { valid: true };
};

/**
 * Validates audio file
 * @param file The file to validate
 * @returns Validation result with success status and error message
 */
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ hỗ trợ file audio: MP3, WAV, OGG' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước file không được vượt quá 10MB' };
  }

  return { valid: true };
};

/**
 * Uploads a vocabulary image to Firebase Storage
 * @param file The image file to upload
 * @param vocabTerm The vocabulary term for naming
 * @returns Upload result with success status and URL
 */
export const uploadVocabImage = async (file: File, vocabTerm: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileName = `vocab/images/${Date.now()}_${vocabTerm}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading vocab image:', error);
    return { success: false, error: 'Lỗi khi upload ảnh từ vựng' };
  }
};

/**
 * Uploads a vocabulary audio to Firebase Storage
 * @param file The audio file to upload
 * @param vocabTerm The vocabulary term for naming
 * @returns Upload result with success status and URL
 */
export const uploadVocabAudio = async (file: File, vocabTerm: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileName = `vocab/audio/${Date.now()}_${vocabTerm}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading vocab audio:', error);
    return { success: false, error: 'Lỗi khi upload audio từ vựng' };
  }
};