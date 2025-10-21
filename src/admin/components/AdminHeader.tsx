import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <div className="admin-header-left">
          <div className="admin-logo" onClick={() => navigate('/admin')}>
            <div className="logo-icon">
              <div className="logo-bird">🐦</div>
            </div>
            <span className="logo-text">EngApp Admin</span>
          </div>
        </div>

        <div className="admin-header-right">
          <div className="admin-info">
            <span className="admin-welcome">
              👋 Chào mừng, <strong>{admin?.username}</strong> ({admin?.role})
            </span>
            <button 
              className="admin-logout-btn"
              onClick={logout}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
