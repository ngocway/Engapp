import { addDoc, collection, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from './config';

export interface VocabDoc {
  id?: string;
  term: string;
  partOfSpeech?: string;
  definitionEn: string;
  translationVi?: string;
  imageUrl?: string;
  phonetics?: { uk?: string; us?: string };
  examples?: string[];
  topicSlug?: string;
  tags?: string[];
  level?: number;
  source?: string;
  createdAt?: number;
  passageId?: string; // Link to specific passage
}

const VOCAB_COLLECTION = 'vocab';

export const vocabService = {
  async add(v: VocabDoc) {
    const ref = await addDoc(collection(db, VOCAB_COLLECTION), v);
    return ref.id;
  },
  async getAll(): Promise<VocabDoc[]> {
    const qs = await getDocs(collection(db, VOCAB_COLLECTION));
    return qs.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  },
  async delete(id: string) {
    await deleteDoc(doc(db, VOCAB_COLLECTION, id));
  },
  
  async update(id: string, data: Partial<VocabDoc>) {
    await updateDoc(doc(db, VOCAB_COLLECTION, id), data);
  },
  
  // Get vocabulary by passage ID
  async getByPassageId(passageId: string): Promise<VocabDoc[]> {
    try {
      console.log('🔍 Getting vocabularies for passageId:', passageId);
      const q = query(collection(db, VOCAB_COLLECTION), where('passageId', '==', passageId));
      const qs = await getDocs(q);
      const results = qs.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('📚 Found vocabularies:', results.length, results);
      return results;
    } catch (error) {
      console.error('Error getting vocabularies by passage ID:', error);
      // If collection doesn't exist, return empty array
      if (error instanceof Error && (error.message.includes('failed-precondition') || error.message.includes('not-found'))) {
        console.log('Collection does not exist yet, returning empty array');
        return [];
      }
      return []; // Return empty array if error
    }
  },
  
  // Delete vocabulary by passage ID
  async deleteByPassageId(passageId: string): Promise<void> {
    const vocabularies = await this.getByPassageId(passageId);
    await Promise.all(vocabularies.map(vocab => this.delete(vocab.id!)));
  },
  
  // Add multiple vocabulary items for a passage
  async addMultipleForPassage(passageId: string, words: string[]): Promise<void> {
    const vocabPromises = words.map(word => this.add({
      term: word,
      definitionEn: `Definition of ${word}`,
      translationVi: `Nghĩa của ${word}`,
      passageId: passageId,
      createdAt: Date.now()
    }));
    
    await Promise.all(vocabPromises);
  },
  
  // Create sample vocabulary for testing
  async createSampleVocabulary(passageId: string): Promise<void> {
    const sampleWords = [
      { term: 'star', definitionEn: 'A bright point of light in the night sky', translationVi: 'ngôi sao' },
      { term: 'tonight', definitionEn: 'This evening or night', translationVi: 'tối nay' },
      { term: 'control', definitionEn: 'To have power over something', translationVi: 'kiểm soát' },
      { term: 'team', definitionEn: 'A group of people working together', translationVi: 'đội nhóm' },
      { term: 'field', definitionEn: 'An area of open land', translationVi: 'cánh đồng' }
    ];
    
    const vocabPromises = sampleWords.map(word => this.add({
      ...word,
      passageId: passageId,
      phonetics: { us: `/${word.term}/` },
      examples: [`Example sentence with ${word.term}`],
      createdAt: Date.now()
    }));
    
    await Promise.all(vocabPromises);
  },
  
  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firebase connection...');
      const qs = await getDocs(collection(db, VOCAB_COLLECTION));
      console.log('✅ Firebase connection successful, collection exists');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }
};




