import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopicSelectComponent from '../../components/TopicSelect';
import Header from '../components/Header';

const TopicSelect: React.FC = () => {
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
      <Header onTabChange={handleTabChange} activeTab="topics" />
      
      <main className="main">
        <TopicSelectComponent 
          onSelect={(topic) => navigate(`/topics/${topic.slug}`)}
        />
      </main>
    </div>
  );
};

export default TopicSelect;










