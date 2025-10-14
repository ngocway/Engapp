import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserSettingsModal from './UserSettingsModal';

type TabType = 'topics' | 'review';

interface HeaderProps {
  onTabChange: (tab: TabType) => void;
  activeTab: TabType;
}

const Header: React.FC<HeaderProps> = ({ onTabChange, activeTab }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
              className={`nav-button ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => onTabChange('topics')}
            >
              Chủ đề
            </button>
            <button 
              className={`nav-button ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => onTabChange('review')}
            >
              Ôn tập
            </button>
          </nav>
        </div>

        {/* User section - bên phải */}
        <div className="header-user">
          {user ? (
            <div className="user-info">
              <div 
                className="user-avatar clickable-avatar"
                onClick={() => setShowSettingsModal(true)}
                title="Click để mở cài đặt"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}
                  </div>
                )}
              </div>
              <span 
                className="user-name clickable-name"
                onClick={() => setShowSettingsModal(true)}
                title="Click để mở cài đặt"
              >
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
      
      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
};

export default Header;
