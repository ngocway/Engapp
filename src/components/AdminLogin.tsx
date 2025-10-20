import React, { useState, useEffect } from 'react';
import { adminAuthService, AdminUser } from '../firebase/adminAuthService';
import { useAdmin } from '../contexts/AdminContext';

interface AdminLoginProps {
  onLoginSuccess?: (admin: AdminUser) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize default admin on component mount
    adminAuthService.initializeDefaultAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting admin login with:', { username, password: '***' });
      const success = await login(username, password);
      console.log('🔐 Login result:', success);
      
      if (success) {
        console.log('✅ Admin login successful');
        if (onLoginSuccess) {
          // Get admin data for callback
          const admin = await adminAuthService.authenticateAdmin(username, password);
          onLoginSuccess(admin!);
        }
      } else {
        console.log('❌ Admin login failed');
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-modal">
        <div className="admin-login-header">
          <h2>🔐 Admin Login</h2>
          <p>Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="admin-login-info">
          <h4>📋 Thông tin đăng nhập mặc định:</h4>
          <div className="credentials-info">
            <p><strong>Admin:</strong> admin / 123456@Abc</p>
            <p><strong>Moderator:</strong> moderator / mod123</p>
          </div>
          <p className="security-note">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Trong môi trường production, 
            hãy thay đổi mật khẩu mặc định và sử dụng hệ thống xác thực bảo mật.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
