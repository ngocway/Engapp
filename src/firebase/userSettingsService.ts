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
      console.error('Error getting user settings:', error);
      return null;
    }
  }
};
