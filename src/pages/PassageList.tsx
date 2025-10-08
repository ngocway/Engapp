import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topic } from '../types';
import PassageListComponent from '../components/PassageList';
import Header from '../components/Header';

const PassageList: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);


  useEffect(() => {
    if (topicSlug) {
      // Map topicSlug to Topic object
      const topics: Topic[] = [
        { id: '1', title: 'Du lịch', name: 'Du lịch', slug: 'travel', thumbnail: '', description: 'Chủ đề về du lịch', level: 1 },
        { id: '2', title: 'Hoạt động hàng ngày', name: 'Hoạt động hàng ngày', slug: 'daily-activities', thumbnail: '', description: 'Chủ đề về hoạt động hàng ngày', level: 1 },
        { id: '3', title: 'Thiên nhiên', name: 'Thiên nhiên', slug: 'nature', thumbnail: '', description: 'Chủ đề về thiên nhiên', level: 1 }
      ];
      
      const foundTopic = topics.find(t => t.slug === topicSlug);
      if (foundTopic) {
        setTopic(foundTopic);
      } else {
        navigate('/topics');
      }
    }
  }, [topicSlug, navigate]);

  if (!topic) {
    return <div>Loading...</div>;
  }

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
        <PassageListComponent 
          topic={topic}
          onBack={() => navigate('/')}
          onOpen={(passage) => navigate(`/passage/${passage.id}`)}
        />
      </main>
    </div>
  );
};

export default PassageList;
