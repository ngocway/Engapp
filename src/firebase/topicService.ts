import { addDoc, collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Topic, Passage } from '../types';

const TOPICS_COLLECTION = 'topics';
const PASSAGES_COLLECTION = 'passages';

export const topicService = {
  async getAll(): Promise<Topic[]> {
    try {
      const qs = await getDocs(collection(db, TOPICS_COLLECTION));
      return qs.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Topic, 'id'>) }));
    } catch (e) {
      console.error('Error fetching topics', e);
      return [];
    }
  },

  async add(topic: Omit<Topic, 'id'>): Promise<string | null> {
    try {
      const ref = await addDoc(collection(db, TOPICS_COLLECTION), topic);
      return ref.id;
    } catch (e) {
      console.error('Error adding topic', e);
      return null;
    }
  }
  ,
  async getBySlug(slug: string): Promise<Topic[]> {
    try {
      const q = query(collection(db, TOPICS_COLLECTION), where('slug', '==', slug));
      const qs = await getDocs(q);
      return qs.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Topic, 'id'>) }));
    } catch (e) {
      console.error('Error getBySlug topic', e);
      return [];
    }
  }
  ,
  async deleteById(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, TOPICS_COLLECTION, id));
      return true;
    } catch (e) {
      console.error('Error deleting topic', e);
      return false;
    }
  }
  ,
  async updateById(id: string, data: Partial<Omit<Topic, 'id'>>): Promise<boolean> {
    try {
      await updateDoc(doc(db, TOPICS_COLLECTION, id), data);
      return true;
    } catch (e) {
      console.error('Error updating topic', e);
      return false;
    }
  },

  // Lấy passage theo ID
  async getPassageById(passageId: string): Promise<Passage | null> {
    try {
      const docRef = doc(db, PASSAGES_COLLECTION, passageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Passage;
      } else {
        console.log('Passage not found:', passageId);
        return null;
      }
    } catch (error) {
      console.error('Error getting passage by ID:', error);
      return null;
    }
  }
};


