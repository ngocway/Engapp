import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: number;
  lastLogin?: number;
}

export const adminAuthService = {
  // Default admin credentials (should be changed in production)
  async initializeDefaultAdmin() {
    try {
      // Skip Firebase initialization to avoid permissions issues
      console.log('✅ Admin authentication ready (bypassing Firebase initialization)');
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  },

  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      console.log('🔐 AdminAuthService authenticateAdmin called with:', { username, password: '***' });
      
      // In production, you should hash passwords and use proper authentication
      // For demo purposes, we'll use simple hardcoded credentials
      const validCredentials = [
        { username: 'admin', password: '123456@Abc', role: 'super_admin' },
        { username: 'moderator', password: 'mod123', role: 'admin' }
      ];

      console.log('🔐 Valid credentials:', validCredentials.map(c => ({ username: c.username, role: c.role })));

      const credential = validCredentials.find(
        cred => cred.username === username && cred.password === password
      );

      console.log('🔐 Found credential:', credential);

      if (!credential) {
        console.log('❌ No matching credential found');
        return null;
      }

      // Return admin user directly without Firebase operations
      // This bypasses the Firebase permissions issue
      const adminUser: AdminUser = {
        id: username,
        username: username,
        email: `${username}@engapp.com`,
        role: credential.role as 'admin' | 'super_admin',
        isActive: true,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      console.log('✅ Admin user created:', adminUser);
      return adminUser;
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return null;
    }
  },

  async getAdminById(adminId: string): Promise<AdminUser | null> {
    try {
      const adminDoc = doc(db, 'adminUsers', adminId);
      const adminSnap = await getDoc(adminDoc);
      
      if (adminSnap.exists()) {
        return adminSnap.data() as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting admin:', error);
      return null;
    }
  },

  async updateAdminLastLogin(adminId: string): Promise<void> {
    try {
      const adminDoc = doc(db, 'adminUsers', adminId);
      await setDoc(adminDoc, { lastLogin: Date.now() }, { merge: true });
    } catch (error) {
      console.error('Error updating admin last login:', error);
    }
  }
};
