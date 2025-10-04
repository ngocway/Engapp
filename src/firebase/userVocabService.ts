import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

// Store user-specific vocab difficulty selections
// Collection: userVocab/{userId}/items/{term}

export type VocabDifficulty = 'easy' | 'normal' | 'hard';

export const userVocabService = {
  async setDifficulty(userId: string, term: string, difficulty: VocabDifficulty) {
    const col = collection(db, 'userVocab', userId, 'items');
    await setDoc(doc(col, term.toLowerCase()), {
      term,
      difficulty,
      updatedAt: Date.now()
    });
  },
  async getAll(userId: string): Promise<Record<VocabDifficulty, string[]>> {
    const col = collection(db, 'userVocab', userId, 'items');
    const qs = await getDocs(col);
    const grouped: Record<VocabDifficulty, string[]> = {
      easy: [],
      normal: [],
      hard: []
    };
    qs.forEach(d => {
      const data = d.data() as any;
      const diff = (data.difficulty || 'normal') as VocabDifficulty;
      grouped[diff].push(data.term);
    });
    return grouped;
  }
};


