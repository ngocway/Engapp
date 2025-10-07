import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopicSelectComponent from '../components/TopicSelect';
import SimpleHeader from '../components/SimpleHeader';

const TopicSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <SimpleHeader />
      
      <main className="main">
        <TopicSelectComponent 
          onSelect={(topic) => navigate(`/topics/${topic.slug}`)}
        />
      </main>
    </div>
  );
};

export default TopicSelect;










