import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { Vocabulary } from '../types';

const VOCABULARY_COLLECTION = 'vocabulary';

export const vocabularyService = {
  // Lấy tất cả từ vựng
  async getAllVocabulary(): Promise<Vocabulary[]> {
    try {
      const querySnapshot = await getDocs(collection(db, VOCABULARY_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vocabulary[];
    } catch (error) {
      console.error('Error getting vocabulary:', error);
      return [];
    }
  },

  // Thêm từ vựng mới
  async addVocabulary(vocabulary: Omit<Vocabulary, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, VOCABULARY_COLLECTION), vocabulary);
      return docRef.id;
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      return null;
    }
  },

  // Cập nhật từ vựng
  async updateVocabulary(id: string, vocabulary: Partial<Vocabulary>): Promise<boolean> {
    try {
      await updateDoc(doc(db, VOCABULARY_COLLECTION, id), vocabulary);
      return true;
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      return false;
    }
  },

  // Xóa từ vựng
  async deleteVocabulary(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, VOCABULARY_COLLECTION, id));
      return true;
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return false;
    }
  }
};














