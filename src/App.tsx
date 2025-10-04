import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import TopicSelect from './pages/TopicSelect';
import PassageList from './pages/PassageList';
import PassageDetail from './pages/PassageDetail';
import MyVocab from './pages/MyVocab';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/topics" element={<TopicSelect />} />
          <Route path="/topics/:topicSlug" element={<PassageList />} />
          <Route path="/passage/:passageId" element={<PassageDetail />} />
          <Route path="/my-vocab" element={<MyVocab />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;