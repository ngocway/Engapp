import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyVocabComponent from '../components/MyVocab';
import Header from '../components/Header';

const MyVocab: React.FC = () => {
  const navigate = useNavigate();

  const handleTabChange = (tab: 'topics' | 'review') => {
    if (tab === 'topics') {
      navigate('/');
    } else if (tab === 'review') {
      navigate('/review');
    }
  };

  return (
    <div className="app">
      <Header onTabChange={handleTabChange} activeTab="review" />
      
      <main className="main">
        <MyVocabComponent 
          onBack={() => {}}
        />
      </main>
    </div>
  );
};

export default MyVocab;
