import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topic, Passage } from '../types';
import PassageListComponent from '../components/PassageList';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const PassageList: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);

  const handleCreatePassage = () => {
    // TODO: Implement create passage functionality
    console.log('Create new passage for topic:', topic?.name);
    // Có thể navigate đến trang tạo đoạn văn mới
    // navigate(`/create-passage/${topicSlug}`);
  };

  const handleEditPassage = (passage: Passage) => {
    // TODO: Implement edit passage functionality
    console.log('Edit passage:', passage.title);
    // Có thể navigate đến trang chỉnh sửa đoạn văn
    // navigate(`/edit-passage/${passage.id}`);
  };

  const handleDeletePassage = (passage: Passage) => {
    // TODO: Implement delete passage functionality
    if (window.confirm(`Bạn có chắc chắn muốn xóa đoạn văn "${passage.title}"?`)) {
      console.log('Delete passage:', passage.title);
      // Có thể gọi API để xóa đoạn văn
    }
  };

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
      <Header />
      
      <main className="main-content">
        <PassageListComponent 
          topic={topic}
          onBack={() => navigate('/topics')}
          onOpen={(passage) => navigate(`/passage/${passage.id}`)}
          onCreatePassage={handleCreatePassage}
          onEditPassage={handleEditPassage}
          onDeletePassage={handleDeletePassage}
        />
      </main>
    </div>
  );
};

export default PassageList;
