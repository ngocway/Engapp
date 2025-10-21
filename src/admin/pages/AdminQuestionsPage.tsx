import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminQuestionsPageComponent from '../components/AdminQuestionsPage';
import { useAdmin } from '../contexts/AdminContext';
import './AdminPage.css';

const AdminQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="https://i.ibb.co/6bPZYBn/logo.png" alt="EngApp Logo" />
          <h2>EngApp</h2>
        </div>

        <nav className="sidebar-menu">
          <button className="menu-item" onClick={() => navigate('/admin')}>
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </button>
          <button className="menu-item" onClick={() => navigate('/admin')}>
            <i className="fa-solid fa-book"></i> Bài học
          </button>
          <button className="menu-item" onClick={() => navigate('/admin/vocabulary')}>
            <i className="fa-solid fa-language"></i> Từ vựng
          </button>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-user-gear"></i> Người dùng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-chart-line"></i> Thống kê
          </a>
          <button className="menu-item active" onClick={() => navigate('/admin/panel')}>
            <i className="fa-solid fa-screwdriver-wrench"></i> Admin Panel
          </button>
        </nav>

        <button className="logout-sidebar" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </aside>

      <main className="main-content">
        <AdminQuestionsPageComponent />
      </main>
    </div>
  );
};

export default AdminQuestionsPage;
