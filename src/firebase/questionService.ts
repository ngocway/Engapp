import { db } from './config';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { Question } from '../types';

const COLLECTION_NAME = 'questions';

export const questionService = {
  // Add a new question
  async add(question: Omit<Question, 'id'>): Promise<string | null> {
    try {
      console.log('🚀 Adding question to database:', question);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...question,
        createdAt: Date.now()
      });
      console.log('✅ Question added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding question:', error);
      return null;
    }
  },

  // Update an existing question
  async update(questionId: string, question: Partial<Question>): Promise<boolean> {
    try {
      const questionRef = doc(db, COLLECTION_NAME, questionId);
      await updateDoc(questionRef, {
        ...question,
        updatedAt: Date.now()
      });
      console.log('✅ Question updated:', questionId);
      return true;
    } catch (error) {
      console.error('❌ Error updating question:', error);
      return false;
    }
  },

  // Delete a question
  async delete(questionId: string): Promise<boolean> {
    try {
      const questionRef = doc(db, COLLECTION_NAME, questionId);
      await deleteDoc(questionRef);
      console.log('✅ Question deleted:', questionId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting question:', error);
      return false;
    }
  },

  // Get all questions
  async getAll(): Promise<Question[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const questions: Question[] = [];
      
      querySnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        } as Question);
      });
      
      console.log('✅ All questions loaded:', questions.length);
      return questions;
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      return [];
    }
  },

  // Get questions by passage ID
  async getByPassageId(passageId: string): Promise<Question[]> {
    try {
      console.log('🔍 Querying questions for passage:', passageId);
      
      // First try with orderBy, if it fails, try without
      try {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('passageId', '==', passageId),
          orderBy('createdAt', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const questions: Question[] = [];
        
        querySnapshot.forEach((doc) => {
          const questionData = {
            id: doc.id,
            ...doc.data()
          } as Question;
          questions.push(questionData);
          console.log('📝 Found question:', questionData);
        });
        
        console.log('✅ Questions loaded for passage:', passageId, questions.length);
        return questions;
      } catch (indexError) {
        console.log('⚠️ Index error, trying without orderBy...');
        
        // Fallback: query without orderBy
        const q = query(
          collection(db, COLLECTION_NAME),
          where('passageId', '==', passageId)
        );
        
        const querySnapshot = await getDocs(q);
        const questions: Question[] = [];
        
        querySnapshot.forEach((doc) => {
          const questionData = {
            id: doc.id,
            ...doc.data()
          } as Question;
          questions.push(questionData);
          console.log('📝 Found question:', questionData);
        });
        
        // Sort manually
        questions.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        console.log('✅ Questions loaded for passage (without index):', passageId, questions.length);
        return questions;
      }
    } catch (error) {
      console.error('❌ Error loading questions for passage:', error);
      return [];
    }
  },

  // Get a single question by ID
  async getById(questionId: string): Promise<Question | null> {
    try {
      const questionRef = doc(db, COLLECTION_NAME, questionId);
      const questionSnap = await getDoc(questionRef);
      
      if (questionSnap.exists()) {
        return {
          id: questionSnap.id,
          ...questionSnap.data()
        } as Question;
      } else {
        console.log('❌ Question not found:', questionId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading question:', error);
      return null;
    }
  }
};