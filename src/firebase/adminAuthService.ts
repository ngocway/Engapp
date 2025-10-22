// Admin Authentication Service (standalone, but with Firebase Auth for Firestore access)
import { auth } from './config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdTokenResult, updateProfile } from 'firebase/auth';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  createdAt: Date;
}

const panelCredentials = [
  { username: 'admin', password: '123456@Abc' }
];

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@engapp.dev';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'Admin123456!';

export const adminAuthService = {
  async login(username: string, password: string): Promise<AdminUser | null> {
    // Step 1: Check panel credentials (UI gate for /admin)
    const matched = panelCredentials.find(c => c.username === username && c.password === password);
    if (!matched) {
      console.log('❌ Admin login failed: invalid panel credentials');
      return null;
    }

    // Step 2: Authenticate with Firebase for Firestore access (but isolated from user auth)
    try {
      // Try sign-in with configured admin email/password
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
        .catch(async (e) => {
          if (e?.code === 'auth/user-not-found') {
            // Create the account automatically (dev convenience)
            const created = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            // Optional: set displayName
            try { await updateProfile(created.user, { displayName: 'Admin' }); } catch {}
            return created;
          }
          throw e;
        });

      // Test Firestore access
      console.log('🔍 Testing Firestore access for admin...');
      try {
        const { db } = await import('./config');
        const { collection, getDocs } = await import('firebase/firestore');
        const topicsSnapshot = await getDocs(collection(db, 'topics'));
        console.log('✅ Firestore topics access successful:', topicsSnapshot.size, 'topics');
      } catch (firestoreError) {
        console.error('❌ Firestore access failed:', firestoreError);
      }

      const adminUser: AdminUser = {
        id: cred.user.uid,
        username: matched.username,
        email: cred.user.email || ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date()
      };

      console.log('✅ Admin login successful with Firebase Auth for Firestore access');
      return adminUser;
    } catch (err) {
      console.warn('⚠️ Firebase admin sign-in failed, using local admin mode:', err instanceof Error ? err.message : String(err));
      
      // Fallback: Return local admin user (for development)
      const adminUser: AdminUser = {
        id: 'local-admin-' + Date.now(),
        username: matched.username,
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date()
      };

      console.log('✅ Local admin login successful (Firebase bypassed)');
      return adminUser;
    }
  },

  async logout(): Promise<void> {
    console.log('✅ Admin logout successful');
  },

  isAdmin(user: any): boolean {
    return user && user.role === 'admin';
  }
};
