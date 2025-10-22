import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import TopicDetailPage from './pages/TopicDetailPage';
import PassageDetail from './pages/PassageDetail';
import PassageList from './pages/PassageList';
import MyVocab from './pages/MyVocab';
import ReviewPage from './pages/ReviewPage';
import TopicSelect from './pages/TopicSelect';

const UserApp: React.FC = () => {
  return (
    <AuthProvider>
      <div className="user-app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topics/:topicSlug" element={<TopicDetailPage />} />
          <Route path="/passage/:id" element={<PassageDetail />} />
          <Route path="/passages" element={<PassageList />} />
          <Route path="/my-vocab" element={<MyVocab />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/topics" element={<TopicSelect />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default UserApp;
