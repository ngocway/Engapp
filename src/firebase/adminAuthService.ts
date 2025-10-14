import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

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
      const adminDoc = doc(db, 'adminUsers', 'default-admin');
      const adminSnap = await getDoc(adminDoc);
      
      if (!adminSnap.exists()) {
        // Create default admin
        const defaultAdmin: AdminUser = {
          id: 'default-admin',
          username: 'admin',
          email: 'admin@engapp.com',
          role: 'super_admin',
          isActive: true,
          createdAt: Date.now()
        };
        
        await setDoc(adminDoc, defaultAdmin);
        console.log('✅ Default admin created: admin/admin123');
      }
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
        { username: 'admin', password: '12345678@Ab', role: 'super_admin' },
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

      // Get admin user from Firestore
      const adminDoc = doc(db, 'adminUsers', username);
      const adminSnap = await getDoc(adminDoc);

      if (adminSnap.exists()) {
        const adminData = adminSnap.data() as AdminUser;
        
        // Update last login
        await setDoc(adminDoc, { lastLogin: Date.now() }, { merge: true });
        
        return adminData;
      } else {
        // Create new admin user if not exists
        const newAdmin: AdminUser = {
          id: username,
          username: username,
          email: `${username}@engapp.com`,
          role: credential.role as 'admin' | 'super_admin',
          isActive: true,
          createdAt: Date.now(),
          lastLogin: Date.now()
        };

        await setDoc(adminDoc, newAdmin);
        return newAdmin;
      }
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
