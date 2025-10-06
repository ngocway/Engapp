import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainMenu from '../components/MainMenu';
import { GameMode } from '../types';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'topicSelect') {
      navigate('/topics');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🌟 Học Tiếng Anh Vui Vẻ</h1>
        <p>Ứng dụng học tiếng Anh dành cho trẻ em</p>
        <div style={{ marginTop: 10 }}>
          <button 
            className="button button-secondary" 
            onClick={() => {
              console.log('My Vocab button clicked!');
              navigate('/my-vocab');
            }} 
            style={{ marginRight: '8px' }}
          >
            🗂️ Từ vựng của tôi
          </button>
          <button 
            className="button" 
            onClick={(e) => {
              e.preventDefault();
              console.log('Admin Panel button clicked!');
              try {
                navigate('/admin');
                console.log('Navigation to /admin successful');
              } catch (error) {
                console.error('Navigation error:', error);
                alert('Có lỗi khi chuyển đến trang admin. Vui lòng thử lại.');
              }
            }} 
            style={{ marginRight: '8px' }}
          >
            🛠️ Admin Panel
          </button>
          
          {user ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                👋 {user.displayName || user.email}
              </span>
              <button 
                className="button button-secondary" 
                onClick={logout}
              >
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              className="button" 
              onClick={login}
            >
              🔐 Đăng nhập
            </button>
          )}
        </div>
      </header>
      
      <main className="main">
        <MainMenu onModeSelect={handleModeSelect} />
      </main>
    </div>
  );
};

export default HomePage;
