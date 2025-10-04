import { addDoc, collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Passage } from '../types';

const PASSAGES_COLLECTION = 'passages';

export const passageService = {
  async getAll(): Promise<Passage[]> {
    try {
      const qs = await getDocs(collection(db, PASSAGES_COLLECTION));
      const passages = qs.docs.map(d => {
        const data = d.data() as any; // Use any to access internal id field for debugging
        // Use Firestore document ID, not the internal 'id' field
        const passage = { id: d.id, ...data };
        console.log('🔍 passageService.getAll - Document ID:', d.id, 'Title:', data.title, 'Internal ID:', data.id);
        return passage;
      });
      console.log('🔍 passageService.getAll - Total passages:', passages.length);
      return passages;
    } catch (e) {
      console.error('Error fetching all passages', e);
      return [];
    }
  },

  async getByTopicSlug(topicSlug: string): Promise<Passage[]> {
    try {
      const q = query(collection(db, PASSAGES_COLLECTION), where('topicSlug', '==', topicSlug));
      const qs = await getDocs(q);
      return qs.docs.map(d => {
        const data = d.data() as any; // Use any to access internal id field for debugging
        // Use Firestore document ID, not the internal 'id' field
        return { id: d.id, ...data };
      });
    } catch (e) {
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
      const { id, ...passageDataWithoutId } = passage;
      console.log('🔍 passageService.update - passage data without id:', passageDataWithoutId);
      
      await updateDoc(docRef, passageDataWithoutId);
      console.log('✅ passageService.update - Successfully updated in Firestore');
      return true;
    } catch (e) {
      console.error('❌ passageService.update - Error updating passage', e);
      
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
  }
};


