import { db } from './config';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface EnglishLevelOption {
  id: string;
  key: string; // 'kids-2-4', 'kids-5-10', etc.
  label: string; // 'Kids 2-4 year olds'
  icon: string; // '👶'
  color: string; // '#ff6b9d'
  order: number; // for sorting
  isActive: boolean;
}

export interface NativeLanguageOption {
  id: string;
  key: string; // 'vietnamese', 'english', 'thai'
  label: string; // 'Tiếng Việt', 'English', 'ไทย'
  icon: string; // '🇻🇳', '🇬🇧', '🇹🇭'
  order: number; // for sorting
  isActive: boolean;
}

export const settingsService = {
  // English Levels Management
  async getEnglishLevels(): Promise<EnglishLevelOption[]> {
    try {
      const col = collection(db, 'settings', 'englishLevels', 'options');
      const snapshot = await getDocs(col);
      const levels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnglishLevelOption));
      
      // Sort by order
      return levels.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting English levels:', error);
      return [];
    }
  },

  async addEnglishLevel(level: Omit<EnglishLevelOption, 'id'>): Promise<string | null> {
    try {
      const col = collection(db, 'settings', 'englishLevels', 'options');
      const docRef = await addDoc(col, level);
      return docRef.id;
    } catch (error) {
      console.error('Error adding English level:', error);
      return null;
    }
  },

  async updateEnglishLevel(id: string, updates: Partial<EnglishLevelOption>): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'englishLevels', 'options', id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating English level:', error);
      return false;
    }
  },

  async deleteEnglishLevel(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'englishLevels', 'options', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting English level:', error);
      return false;
    }
  },

  // Native Languages Management
  async getNativeLanguages(): Promise<NativeLanguageOption[]> {
    try {
      const col = collection(db, 'settings', 'nativeLanguages', 'options');
      const snapshot = await getDocs(col);
      const languages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NativeLanguageOption));
      
      // Sort by order
      return languages.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting native languages:', error);
      return [];
    }
  },

  async addNativeLanguage(language: Omit<NativeLanguageOption, 'id'>): Promise<string | null> {
    try {
      const col = collection(db, 'settings', 'nativeLanguages', 'options');
      const docRef = await addDoc(col, language);
      return docRef.id;
    } catch (error) {
      console.error('Error adding native language:', error);
      return null;
    }
  },

  async updateNativeLanguage(id: string, updates: Partial<NativeLanguageOption>): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'nativeLanguages', 'options', id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating native language:', error);
      return false;
    }
  },

  async deleteNativeLanguage(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'nativeLanguages', 'options', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting native language:', error);
      return false;
    }
  },

  // Initialize default data
  async initializeDefaultSettings(): Promise<void> {
    console.log('🚀 Initializing default settings...');
    
    try {
      // Initialize English Levels
      const existingLevels = await this.getEnglishLevels();
      if (existingLevels.length === 0) {
        console.log('📚 Adding default English levels...');
        const defaultLevels = [
          {
            key: 'kids-2-4',
            label: 'Kids 2-4 year olds',
            icon: '👶',
            color: '#ff6b9d',
            order: 1,
            isActive: true
          },
          {
            key: 'kids-5-10',
            label: 'Kids 5-10 year olds',
            icon: '🧒',
            color: '#4ecdc4',
            order: 2,
            isActive: true
          },
          {
            key: 'basic',
            label: 'Basic User',
            icon: '🌱',
            color: '#10b981',
            order: 3,
            isActive: true
          },
          {
            key: 'independent',
            label: 'Independent User',
            icon: '🌿',
            color: '#3b82f6',
            order: 4,
            isActive: true
          },
          {
            key: 'proficient',
            label: 'Proficient User',
            icon: '🌳',
            color: '#ef4444',
            order: 5,
            isActive: true
          }
        ];

        for (const level of defaultLevels) {
          await this.addEnglishLevel(level);
        }
        console.log('✅ English levels initialized');
      }

      // Initialize Native Languages
      const existingLanguages = await this.getNativeLanguages();
      if (existingLanguages.length === 0) {
        console.log('🌍 Adding default native languages...');
        const defaultLanguages = [
          {
            key: 'vietnamese',
            label: 'Tiếng Việt',
            icon: '🇻🇳',
            order: 1,
            isActive: true
          },
          {
            key: 'english',
            label: 'English',
            icon: '🇬🇧',
            order: 2,
            isActive: true
          },
          {
            key: 'thai',
            label: 'ไทย',
            icon: '🇹🇭',
            order: 3,
            isActive: true
          }
        ];

        for (const language of defaultLanguages) {
          await this.addNativeLanguage(language);
        }
        console.log('✅ Native languages initialized');
      }

      console.log('🎉 Default settings initialization completed!');
    } catch (error) {
      console.error('❌ Error initializing default settings:', error);
    }
  }
};
