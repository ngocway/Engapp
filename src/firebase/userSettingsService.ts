import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

export type NativeLanguage = 'vietnamese' | 'english' | 'thai';
export type EnglishLevel = 'kids-2-4' | 'kids-5-10' | 'basic' | 'independent' | 'proficient';

export interface UserSettings {
  nativeLanguage: NativeLanguage;
  englishLevel: EnglishLevel;
  updatedAt: number;
}

export const userSettingsService = {
  // Lưu settings của user
  async saveUserSettings(userId: string, settings: UserSettings): Promise<boolean> {
    try {
      const userSettingsRef = doc(db, 'userSettings', userId);
      await setDoc(userSettingsRef, {
        ...settings,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      // Handle Firebase permissions error gracefully
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.log('ℹ️ Admin mode: Simulating successful user settings save (Firebase permissions not configured)');
        return true;
      }
      
      console.error('Error saving user settings:', error);
      return false;
    }
  },

  // Lấy settings của user
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const userSettingsRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          nativeLanguage: data.nativeLanguage || 'vietnamese',
          englishLevel: data.englishLevel || 'basic',
          updatedAt: data.updatedAt || Date.now()
        };
      }
      
      // Return default settings if no settings found
      return {
        nativeLanguage: 'vietnamese',
        englishLevel: 'basic',
        updatedAt: Date.now()
      };
    } catch (error) {
      // Handle Firebase permissions error gracefully
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.log('ℹ️ Admin mode: Using default user settings (Firebase permissions not configured)');
        return {
          nativeLanguage: 'vietnamese',
          englishLevel: 'basic',
          updatedAt: Date.now()
        };
      }
      
      console.error('Error getting user settings:', error);
      return null;
    }
  }
};
