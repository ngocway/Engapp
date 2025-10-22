import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuthService, AdminUser } from '../../firebase/adminAuthService';

interface AdminContextType {
  admin: AdminUser | null;
  isAdminLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminContextProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in (from sessionStorage - separate from user auth)
    const checkAdminSession = () => {
      try {
        const savedAdmin = sessionStorage.getItem('adminUser');
        if (savedAdmin) {
          const adminData = JSON.parse(savedAdmin) as AdminUser;
          setAdmin(adminData);
          console.log('✅ Admin session restored:', adminData.username);
        }
      } catch (error) {
        console.error('Error restoring admin session:', error);
        sessionStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AdminContext login called with:', { username, password: '***' });
      const adminUser = await adminAuthService.login(username, password);
      console.log('🔐 AdminAuthService result:', adminUser);
      
      if (adminUser) {
        setAdmin(adminUser);
        sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
        console.log('✅ Admin login successful:', adminUser.username);
        return true;
      }
      
      console.log('❌ No admin user returned');
      return false;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem('adminUser');
    console.log('👋 Admin logged out');
  };

  const value: AdminContextType = {
    admin,
    isAdminLoggedIn: !!admin,
    login,
    logout,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
