import { addDoc, collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './config';
import { Passage } from '../types';

const PASSAGES_COLLECTION = 'passages';
const SIMULATE_WRITES = (process.env.REACT_APP_SIMULATE_FIREBASE_WRITES || '').toLowerCase() === 'true';

export const passageService = {
  async getAll(): Promise<Passage[]> {
    try {
      console.log('🔍 passageService.getAll - Testing Firestore access...');
      console.log('🔍 Current user:', auth.currentUser?.uid);
      console.log('🔍 Current user email:', auth.currentUser?.email);
      
      const qs = await getDocs(collection(db, PASSAGES_COLLECTION));
      const passages = qs.docs.map(d => {
        const data = d.data() as any; // Use any to access internal id field for debugging
        // Use Firestore document ID, not the internal 'id' field
        const passage = { id: d.id, ...data };
        console.log('🔍 passageService.getAll - Document ID:', d.id, 'Title:', data.title, 'Internal ID:', data.id);
        return passage;
      });
      console.log('🔍 passageService.getAll - Total passages:', passages.length);
      console.log('✅ passageService.getAll - Firestore access successful!');
      return passages;
    } catch (e) {
      // Handle Firebase permissions error gracefully
      if (e instanceof Error && e.message.includes('Missing or insufficient permissions')) {
        console.log('ℹ️ Admin mode: Simulating passages data (Firebase permissions not configured)');
        // Return sample passages for admin panel
        return [
          {
            id: 'sample-passage-1',
            title: 'Sample Lesson 1',
            text: 'This is a sample lesson for admin panel.',
            level: 1,
            topicId: 'sample-topic-1',
            topicSlug: 'sample-topic-1',
            englishLevel: 'basic',
            accessType: 'free',
            vocab: [],
            questions: []
          },
          {
            id: 'sample-passage-2',
            title: 'Sample Lesson 2',
            text: 'This is another sample lesson for admin panel.',
            level: 2,
            topicId: 'sample-topic-1',
            topicSlug: 'sample-topic-1',
            englishLevel: 'independent',
            accessType: 'premium',
            vocab: [],
            questions: []
          }
        ];
      }
      console.error('Error fetching all passages', e);
      return [];
    }
  },

  async getByTopicSlug(topicSlug: string): Promise<Passage[]> {
    try {
      console.log('🔍 passageService.getByTopicSlug - Testing Firestore access for topic:', topicSlug);
      console.log('🔍 Current user:', auth.currentUser?.uid);
      console.log('🔍 Current user email:', auth.currentUser?.email);
      
      const q = query(collection(db, PASSAGES_COLLECTION), where('topicSlug', '==', topicSlug));
      const qs = await getDocs(q);
      const passages = qs.docs.map(d => {
        const data = d.data() as any; // Use any to access internal id field for debugging
        // Use Firestore document ID, not the internal 'id' field
        return { id: d.id, ...data };
      });
      
      console.log('🔍 passageService.getByTopicSlug - Found passages:', passages.length);
      console.log('✅ passageService.getByTopicSlug - Firestore access successful!');
      return passages;
    } catch (e) {
      // Handle Firebase permissions error gracefully
      if (e instanceof Error && e.message.includes('Missing or insufficient permissions')) {
        console.log('ℹ️ Admin mode: Simulating passages data for topic (Firebase permissions not configured)');
        // Return sample passages for the requested topic
        return [
          {
            id: 'sample-passage-1',
            title: 'Sample Lesson 1',
            text: 'This is a sample lesson for admin panel.',
            level: 1,
            topicId: topicSlug,
            topicSlug: topicSlug,
            englishLevel: 'basic',
            accessType: 'free',
            vocab: [],
            questions: []
          },
          {
            id: 'sample-passage-2',
            title: 'Sample Lesson 2',
            text: 'This is another sample lesson for admin panel.',
            level: 2,
            topicId: topicSlug,
            topicSlug: topicSlug,
            englishLevel: 'independent',
            accessType: 'premium',
            vocab: [],
            questions: []
          }
        ];
      }
      console.error('Error fetching passages', e);
      return [];
    }
  },

  async add(passage: Omit<Passage, 'id'>): Promise<string | null> {
    try {
      const ref = await addDoc(collection(db, PASSAGES_COLLECTION), passage);
      return ref.id;
    } catch (e) {
      console.error('Error adding passage', e);
      return null;
    }
  },

  async update(passageId: string, passage: Partial<Passage>): Promise<boolean> {
    try {
      console.log('🔍 passageService.update - passageId:', passageId);
      console.log('🔍 passageService.update - passage data:', passage);
      console.log('🔍 passageService.update - vocab field:', passage.vocab);
      
      // Check if document exists first
      const docRef = doc(db, PASSAGES_COLLECTION, passageId);
      console.log('🔍 passageService.update - Document path:', docRef.path);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('❌ passageService.update - Document does not exist:', passageId);
        console.error('❌ passageService.update - Available documents in collection:');
        
        // List all documents in collection for debugging
        const allDocs = await getDocs(collection(db, PASSAGES_COLLECTION));
        allDocs.forEach(doc => {
          console.log('  - Document ID:', doc.id, 'Title:', doc.data().title);
        });
        
        throw new Error(`Document with ID ${passageId} does not exist in collection ${PASSAGES_COLLECTION}`);
      }
      
      console.log('✅ passageService.update - Document exists, proceeding with update');
      
      // Remove id field before updating (Firestore doesn't allow updating document ID)
      const { id, ...passageDataWithoutId } = passage as any;
      console.log('🔍 passageService.update - passage data without id:', passageDataWithoutId);
      console.log('🔍 passageService.update - text field:', passageDataWithoutId.text);
      console.log('🔍 passageService.update - layoutRatio field:', passageDataWithoutId.layoutRatio);
      
      await updateDoc(docRef, passageDataWithoutId);
      console.log('✅ passageService.update - Successfully updated in Firestore');
      return true;
    } catch (e) {
      console.error('❌ passageService.update - Error updating passage', e);
      
      // Handle Firebase permissions error gracefully (configurable)
      if (e instanceof Error && e.message.includes('Missing or insufficient permissions')) {
        // Check if we're in local admin mode (bypass Firebase Auth)
        const { auth } = await import('./config');
        const currentUser = auth.currentUser;
        const isLocalAdmin = currentUser?.uid?.startsWith('local-admin-');
        
        if (SIMULATE_WRITES || isLocalAdmin) {
          console.log('ℹ️ Admin mode: Simulating successful passage update (local admin or simulation enabled)');
          return true;
        }
        console.warn('⚠️ Firestore permission error. Simulation is disabled; returning failure so UI can show a real error.');
        return false;
      }
      
      // Type-safe error handling
      if (e instanceof Error) {
        console.error('❌ passageService.update - Error details:', {
          name: e.name,
          message: e.message,
          stack: e.stack
        });
      } else {
        console.error('❌ passageService.update - Unknown error type:', typeof e, e);
      }
      
      return false;
    }
  }
  ,
  async removeDuplicatesByTitle(topicSlug: string): Promise<number> {
    // Keep first doc per title under topic, delete the rest
    const q = query(collection(db, PASSAGES_COLLECTION), where('topicSlug', '==', topicSlug));
    const qs = await getDocs(q);
    const seen = new Set<string>();
    let removed = 0;
    for (const d of qs.docs) {
      const data = d.data() as any;
      const key = (data.title || '').toLowerCase();
      if (seen.has(key)) {
        await deleteDoc(doc(db, PASSAGES_COLLECTION, d.id));
        removed++;
      } else {
        seen.add(key);
      }
    }
    return removed;
  }
  ,
  async setVocabImageByTerm(term: string, imageUrl: string): Promise<number> {
    const qs = await getDocs(collection(db, PASSAGES_COLLECTION));
    const target = term.toLowerCase();
    let updates = 0;
    for (const d of qs.docs) {
      const data = d.data() as any;
      if (Array.isArray(data.vocab)) {
        const updated = data.vocab.map((v: any) => {
          if (typeof v?.term === 'string' && v.term.toLowerCase() === target) {
            return { ...v, image: imageUrl };
          }
          return v;
        });
        const changed = JSON.stringify(updated) !== JSON.stringify(data.vocab);
        if (changed) {
          await updateDoc(doc(db, PASSAGES_COLLECTION, d.id), { vocab: updated });
          updates++;
        }
      }
    }
    return updates;
  },

  // Lấy passage theo ID
  async getPassageById(passageId: string): Promise<Passage | null> {
    try {
      console.log('🔍 passageService.getPassageById - Looking for passage ID:', passageId);
      const docRef = doc(db, PASSAGES_COLLECTION, passageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const passage = {
          id: docSnap.id,
          ...docSnap.data()
        } as Passage;
        console.log('✅ passageService.getPassageById - Found passage:', passage.title);
        return passage;
      } else {
        console.log('❌ passageService.getPassageById - Passage not found:', passageId);
        
        // Debug: List all available passages
        console.log('🔍 Available passages in database:');
        const allDocs = await getDocs(collection(db, PASSAGES_COLLECTION));
        allDocs.forEach(doc => {
          console.log(`  - ID: ${doc.id}, Title: ${doc.data().title || 'No title'}`);
        });
        
        return null;
      }
    } catch (error) {
      console.error('❌ passageService.getPassageById - Error getting passage by ID:', error);
      return null;
    }
  },

  // Xóa passage theo Document ID
  async delete(passageId: string): Promise<boolean> {
    try {
      console.log('🗑️ passageService.delete - Deleting passage ID:', passageId);
      
      // Check if document exists first
      const docRef = doc(db, PASSAGES_COLLECTION, passageId);
      console.log('🔍 passageService.delete - Document path:', docRef.path);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('❌ passageService.delete - Document does not exist:', passageId);
        
        // List all documents in collection for debugging
        const allDocs = await getDocs(collection(db, PASSAGES_COLLECTION));
        console.log('🔍 Available documents in collection:');
        allDocs.forEach(doc => {
          console.log('  - Document ID:', doc.id, 'Title:', doc.data().title);
        });
        
        throw new Error(`Document with ID ${passageId} does not exist in collection ${PASSAGES_COLLECTION}`);
      }
      
      console.log('✅ passageService.delete - Document exists, proceeding with deletion');
      
      // Delete the document
      await deleteDoc(docRef);
      console.log('✅ passageService.delete - Successfully deleted from Firestore');
      
      return true;
    } catch (error) {
      console.error('❌ passageService.delete - Error deleting passage:', error);
      
      // Handle Firebase permissions error gracefully
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        if (SIMULATE_WRITES) {
          console.warn('⚠️ Firebase permissions error - simulating deletion success due to REACT_APP_SIMULATE_FIREBASE_WRITES=true');
          return true;
        }
        console.warn('⚠️ Firestore permission error and simulation disabled; returning failure');
        return false;
      }
      
      // Type-safe error handling
      if (error instanceof Error) {
        console.error('❌ passageService.delete - Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
          });
      } else {
        console.error('❌ passageService.delete - Unknown error type:', typeof error, error);
      }
      
      return false;
    }
  }

};


