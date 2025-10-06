import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProgress } from '../types';

const PROGRESS_COLLECTION = 'userProgress';

export const progressService = {
  // Lấy tiến độ học tập của user
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const docRef = doc(db, PROGRESS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProgress;
      } else {
        // Tạo tiến độ mới nếu chưa có
        const newProgress: UserProgress = {
          userId,
          learnedWords: [],
          completedSentences: [],
          score: 0,
          level: 1
        };
        await this.saveUserProgress(newProgress);
        return newProgress;
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  },

  // Lưu tiến độ học tập
  async saveUserProgress(progress: UserProgress): Promise<boolean> {
    try {
      await setDoc(doc(db, PROGRESS_COLLECTION, progress.userId), progress);
      return true;
    } catch (error) {
      console.error('Error saving user progress:', error);
      return false;
    }
  },

  // Cập nhật từ đã học
  async addLearnedWord(userId: string, wordId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId);
      if (progress && progress.learnedWords && !progress.learnedWords.includes(wordId)) {
        progress.learnedWords.push(wordId);
        progress.score += 5; // Mỗi từ mới được 5 điểm
        progress.level = Math.floor(progress.learnedWords.length / 10) + 1; // Mỗi 10 từ tăng 1 level
        return await this.saveUserProgress(progress);
      }
      return true;
    } catch (error) {
      console.error('Error adding learned word:', error);
      return false;
    }
  },

  // Cập nhật câu đã hoàn thành
  async addCompletedSentence(userId: string, sentenceId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId);
      if (progress && !progress.completedSentences.includes(sentenceId)) {
        progress.completedSentences.push(sentenceId);
        progress.score += 10; // Mỗi câu hoàn thành được 10 điểm
        return await this.saveUserProgress(progress);
      }
      return true;
    } catch (error) {
      console.error('Error adding completed sentence:', error);
      return false;
    }
  },

  // Cập nhật passage đã hoàn thành (đã trả lời hết câu hỏi)
  async addCompletedPassage(userId: string, passageId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId);
      if (progress) {
        // Khởi tạo completedPassages nếu chưa có
        if (!progress.completedPassages) {
          progress.completedPassages = [];
        }
        
        if (!progress.completedPassages.includes(passageId)) {
          progress.completedPassages.push(passageId);
          progress.score += 20; // Mỗi passage hoàn thành được 20 điểm
          return await this.saveUserProgress(progress);
        }
      }
      return true;
    } catch (error) {
      console.error('Error adding completed passage:', error);
      return false;
    }
  }
};










