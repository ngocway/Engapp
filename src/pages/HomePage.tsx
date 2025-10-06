import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TopicsSection from '../components/TopicsSection';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <TopicsSection />
      </main>
    </div>
  );
};

export default HomePage;
