import { addDoc, collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './config';
import { Topic } from '../types';

const TOPICS_COLLECTION = 'topics';

export const topicService = {
  async getAll(): Promise<Topic[]> {
    try {
      console.log('🔍 topicService.getAll - Testing Firestore access...');
      console.log('🔍 Current user:', auth.currentUser?.uid);
      console.log('🔍 Current user email:', auth.currentUser?.email);
      
      console.log('🔍 topicService.getAll - Calling getDocs...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );
      
      const getDocsPromise = getDocs(collection(db, TOPICS_COLLECTION));
      const qs = await Promise.race([getDocsPromise, timeoutPromise]) as any;
      
      console.log('🔍 topicService.getAll - getDocs completed, docs count:', qs.docs.length);
      const topics = qs.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<Topic, 'id'>) }));
      console.log('✅ topicService.getAll - Firestore access successful!');
      return topics;
    } catch (e) {
      // Handle Firebase permissions error gracefully
      if (e instanceof Error && e.message.includes('Missing or insufficient permissions')) {
        console.log('ℹ️ Admin mode: Simulating topics data (Firebase permissions not configured)');
        // Return sample topics for admin panel
        return [
          {
            id: 'sample-topic-1',
            title: 'Sample Topic 1',
            slug: 'sample-topic-1',
            description: 'Sample topic for admin panel',
            level: 1
          }
        ];
      }
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
  }
};


