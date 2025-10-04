import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topic } from '../types';
import PassageListComponent from '../components/PassageList';

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

  return (
    <div className="app">
      <header className="header">
        <h1>🌟 Học Tiếng Anh Vui Vẻ</h1>
        <p>Ứng dụng học tiếng Anh dành cho trẻ em</p>
        <div style={{ marginTop: 10 }}>
          <button 
            className="button" 
            onClick={() => navigate('/my-vocab')} 
            style={{ padding: '8px 14px', marginRight: '8px' }}
          >
            🗂️ Từ vựng của tôi
          </button>
          <button 
            className="button" 
            onClick={() => navigate('/admin')} 
            style={{ padding: '8px 14px', marginRight: '8px' }}
          >
            🛠️ Admin Panel
          </button>
        </div>
      </header>
      
      <main className="main">
        <PassageListComponent 
          topic={topic}
          onBack={() => {}}
          onOpen={(passage) => navigate(`/passage/${passage.id}`)}
        />
      </main>
    </div>
  );
};

export default PassageList;
