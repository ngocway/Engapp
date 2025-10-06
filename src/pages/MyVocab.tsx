import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyVocabComponent from '../components/MyVocab';
import Header from '../components/Header';

const MyVocab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <MyVocabComponent 
          onBack={() => {}}
        />
      </main>
    </div>
  );
};

export default MyVocab;
