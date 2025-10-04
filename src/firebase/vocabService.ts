import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  }
};




