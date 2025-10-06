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
            className="button" 
            onClick={() => {
              console.log('My Vocab button clicked!');
              navigate('/my-vocab');
            }} 
            style={{ padding: '8px 14px', marginRight: '8px' }}
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
            style={{ 
              padding: '8px 14px', 
              marginRight: '8px',
              position: 'relative',
              zIndex: 10,
              cursor: 'pointer'
            }}
          >
            🛠️ Admin Panel
          </button>
          
          {/* Test button để kiểm tra navigation */}
          <button 
            className="button" 
            onClick={() => {
              console.log('Test button clicked!');
              alert('Test button hoạt động!');
            }} 
            style={{ 
              padding: '8px 14px', 
              marginRight: '8px',
              backgroundColor: '#ff6b6b'
            }}
          >
            🧪 Test Button
          </button>
          
          {user ? (
            <div style={{ display: 'inline-block' }}>
              <span style={{ color: 'white', marginRight: '10px' }}>
                👋 {user.displayName || user.email}
              </span>
              <button 
                className="button" 
                onClick={logout}
                style={{ padding: '8px 14px' }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              className="button" 
              onClick={login}
              style={{ padding: '8px 14px' }}
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
