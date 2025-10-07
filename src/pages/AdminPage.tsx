import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Topic, Passage } from '../types';
import PassageListComponent from '../components/PassageList';
import PassageEditModal from '../components/PassageEditModal';
import SimpleHeader from '../components/SimpleHeader';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [topics] = useState<Topic[]>([
    { id: '1', title: 'Thiên nhiên', name: 'Thiên nhiên', slug: 'nature', thumbnail: '', description: 'Chủ đề về thiên nhiên', level: 1 },
    { id: '2', title: 'Hoạt động hàng ngày', name: 'Hoạt động hàng ngày', slug: 'daily-activities', thumbnail: '', description: 'Chủ đề về hoạt động hàng ngày', level: 1 },
    { id: '3', title: 'Du lịch', name: 'Du lịch', slug: 'travel', thumbnail: '', description: 'Chủ đề về du lịch', level: 1 }
  ]);

  useEffect(() => {
    // Mặc định chọn topic đầu tiên
    if (topics.length > 0 && !selectedTopic) {
      setSelectedTopic(topics[0]);
    }
  }, [topics, selectedTopic]);

  const handleEditPassage = (passage: Passage) => {
    setEditingPassage(passage);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPassage(null);
  };

  const handleSavePassage = (updatedPassage: Passage) => {
    console.log('Passage updated:', updatedPassage);
    // Có thể thêm logic refresh data ở đây nếu cần
  };


  // Trong giai đoạn phát triển, cho phép truy cập admin mà không cần đăng nhập
  // TODO: Bật lại kiểm tra auth khi deploy production

  return (
    <div className="app">
      <SimpleHeader />
      
      <main className="main">
        <div className="admin-page-container">
          {/* Topic Selection */}
          <div className="admin-topic-selector">
            <div className="topic-tabs">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  className={`topic-tab ${selectedTopic?.id === topic.id ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic.slug === 'nature' ? '🌿' : topic.slug === 'travel' ? '✈️' : '🏠'} {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* Passage List */}
          {selectedTopic && (
            <PassageListComponent 
              topic={selectedTopic}
              onBack={() => {}}
              onOpen={(passage) => console.log('Open passage:', passage.title)}
            />
          )}

          {/* Edit Passage Modal */}
          <PassageEditModal
            passage={editingPassage}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSavePassage}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;