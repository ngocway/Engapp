import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminVocabPage from '../components/AdminVocabPage';
import AdminQuestionsPage from '../components/AdminQuestionsPage';
import AdminTopicsPage from '../components/AdminTopicsPage';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vocab' | 'questions' | 'topics'>('vocab');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                🛠️ Admin Panel
              </h1>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                Quản lý nội dung học tiếng Anh
              </p>
            </div>
            <Link 
              to="/" 
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '10px 20px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '25px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setActiveTab('vocab')}
              style={{
                padding: '15px 30px',
                border: 'none',
                backgroundColor: activeTab === 'vocab' ? '#667eea' : 'transparent',
                color: activeTab === 'vocab' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                borderBottom: activeTab === 'vocab' ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              📚 Quản lý từ vựng
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              style={{
                padding: '15px 30px',
                border: 'none',
                backgroundColor: activeTab === 'questions' ? '#667eea' : 'transparent',
                color: activeTab === 'questions' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                borderBottom: activeTab === 'questions' ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              ❓ Quản lý câu hỏi
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              style={{
                padding: '15px 30px',
                border: 'none',
                backgroundColor: activeTab === 'topics' ? '#667eea' : 'transparent',
                color: activeTab === 'topics' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                borderBottom: activeTab === 'topics' ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              🏷️ Quản lý chủ đề
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {activeTab === 'vocab' ? (
          <AdminVocabPage />
        ) : activeTab === 'questions' ? (
          <AdminQuestionsPage />
        ) : (
          <AdminTopicsPage />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2024 Học Tiếng Anh Vui Vẻ - Admin Panel
        </p>
      </footer>
    </div>
  );
};

export default AdminPage;

