import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo, tên app và navigation */}
        <div className="header-left">
          <div className="header-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <div className="logo-bird">🐦</div>
            </div>
            <span className="logo-text">EngApp</span>
          </div>

          {/* Navigation - sát bên tên app */}
          <nav className="header-nav">
            <button 
              className={`nav-button ${location.pathname === '/topics' || location.pathname.startsWith('/topics/') || location.pathname.startsWith('/passage/') ? 'active' : ''}`}
              onClick={() => navigate('/topics')}
            >
              Chủ đề
            </button>
            <button 
              className={`nav-button ${location.pathname === '/review' ? 'active' : ''}`}
              onClick={() => navigate('/review')}
            >
              Ôn tập
            </button>
          </nav>
        </div>

        {/* User section - bên phải */}
        <div className="header-user">
          {user ? (
            <div className="user-info">
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}
                  </div>
                )}
              </div>
              <span className="user-name">
                {user.displayName || user.email}
              </span>
              <button 
                className="logout-button"
                onClick={logout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={login}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
