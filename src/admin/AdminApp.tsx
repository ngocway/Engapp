import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminContextProvider } from './contexts/AdminContext';
import AdminPage from './pages/AdminPage';
import AdminQuestionsPage from './components/AdminQuestionsPage';
import AdminVocabularyPage from './components/AdminVocabularyPage';
import './pages/AdminPage.css';

const AdminApp: React.FC = () => {
  return (
    <AdminContextProvider>
      <div className="admin-app">
        <Routes>
          <Route index element={<AdminPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="vocabulary" element={<AdminVocabularyPage />} />
        </Routes>
      </div>
    </AdminContextProvider>
  );
};

export default AdminApp;
