import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopicSelectComponent from '../components/TopicSelect';

const TopicSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="header">
        <h1>🌟 Học Tiếng Anh Vui Vẻ</h1>
        <p>Ứng dụng học tiếng Anh dành cho trẻ em</p>
        <div style={{ marginTop: 10 }}>
          <button 
            className="button" 
            onClick={() => navigate('/my-vocab')} 
            style={{ padding: '8px 14px', marginRight: '8px' }}
          >
            🗂️ Từ vựng của tôi
          </button>
          <button 
            className="button" 
            onClick={() => navigate('/admin')} 
            style={{ padding: '8px 14px', marginRight: '8px' }}
          >
            🛠️ Admin Panel
          </button>
        </div>
      </header>
      
      <main className="main">
        <TopicSelectComponent 
          onSelect={(topic) => navigate(`/topics/${topic.slug}`)}
        />
      </main>
    </div>
  );
};

export default TopicSelect;








