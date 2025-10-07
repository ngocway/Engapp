import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyVocabComponent from '../components/MyVocab';
import SimpleHeader from '../components/SimpleHeader';

const MyVocab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <SimpleHeader />
      
      <main className="main">
        <MyVocabComponent 
          onBack={() => {}}
        />
      </main>
    </div>
  );
};

export default MyVocab;
