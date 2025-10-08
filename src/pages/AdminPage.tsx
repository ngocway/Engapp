import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Topic, Passage } from '../types';
import PassageListComponent from '../components/PassageList';
import PassageEditModal from '../components/PassageEditModal';
import VocabManagementModal from '../components/VocabManagementModal';
import Header from '../components/Header';
import { passageService } from '../firebase/passageService';
import { topicService } from '../firebase/topicService';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [managingVocabPassage, setManagingVocabPassage] = useState<Passage | null>(null);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: 'topics' | 'review') => {
    if (tab === 'topics') {
      navigate('/');
    } else if (tab === 'review') {
      navigate('/review');
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    // Mặc định chọn topic đầu tiên
    if (topics.length > 0 && !selectedTopic) {
      setSelectedTopic(topics[0]);
    }
  }, [topics, selectedTopic]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await topicService.getAll();
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
      // Fallback to static data if Firebase fails
      setTopics([
        { id: '1', title: 'Thiên nhiên', name: 'Thiên nhiên', slug: 'nature', thumbnail: '', description: 'Chủ đề về thiên nhiên', level: 1 },
        { id: '2', title: 'Hoạt động hàng ngày', name: 'Hoạt động hàng ngày', slug: 'daily-activities', thumbnail: '', description: 'Chủ đề về hoạt động hàng ngày', level: 1 },
        { id: '3', title: 'Du lịch', name: 'Du lịch', slug: 'travel', thumbnail: '', description: 'Chủ đề về du lịch', level: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPassage = (passage: Passage) => {
    console.log('🔍 Opening edit modal for passage:', passage);
    console.log('🔍 Passage ID:', passage.id);
    console.log('🔍 Passage data:', passage);
    setEditingPassage(passage);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPassage(null);
  };

  const handleSavePassage = async (updatedPassage: Passage) => {
    console.log('💾 AdminPage handleSavePassage called with:', updatedPassage);
    try {
      // Note: The actual update is already done in PassageEditModal
      // This is just for additional handling if needed
      console.log('✅ Passage saved successfully in AdminPage');
      // Reload topics to refresh the passage list
      loadTopics();
    } catch (error) {
      console.error('❌ Error in AdminPage handleSavePassage:', error);
      alert('Lỗi khi cập nhật bài học');
    }
  };

  const handleDeletePassage = async (passage: Passage) => {
    console.log('🗑️ AdminPage handleDeletePassage called with:', passage);
    
    if (window.confirm(`Bạn có chắc muốn xóa bài học "${passage.title}"?`)) {
      try {
        console.log('🗑️ Deleting passage with Document ID:', passage.id);
        const deleteResult = await passageService.delete(passage.id);
        
        if (deleteResult) {
          console.log('✅ Passage deleted successfully');
          alert('Đã xóa bài học thành công!');
          // Reload topics to refresh the passage list
          loadTopics();
        } else {
          console.log('❌ Failed to delete passage');
          alert('Lỗi khi xóa bài học');
        }
      } catch (error) {
        console.error('❌ Error in AdminPage handleDeletePassage:', error);
        alert('Lỗi khi xóa bài học');
      }
    }
  };

  const handleManageVocab = async (passage: Passage) => {
    try {
      console.log('📚 Loading full passage data for vocab management:', passage.id);
      // Load full passage data from database to ensure we have vocab field
      const fullPassage = await passageService.getPassageById(passage.id);
      if (fullPassage) {
        console.log('📚 Full passage data:', fullPassage);
        setManagingVocabPassage(fullPassage);
        setIsVocabModalOpen(true);
      } else {
        console.error('❌ Could not load passage:', passage.id);
        alert('Không thể tải dữ liệu bài học');
      }
    } catch (error) {
      console.error('❌ Error loading passage for vocab management:', error);
      alert('Lỗi khi tải dữ liệu bài học');
    }
  };

  const handleCloseVocabModal = () => {
    setIsVocabModalOpen(false);
    setManagingVocabPassage(null);
  };

  const handleAddPassage = () => {
    // Create a new empty passage for the current topic
    const newPassage: Passage = {
      id: '', // Will be generated by Firebase
      title: '',
      text: '',
      level: 1,
      topicId: selectedTopic?.id || '',
      topicSlug: selectedTopic?.slug || ''
    };
    setEditingPassage(newPassage);
    setIsEditModalOpen(true);
  };


  // Trong giai đoạn phát triển, cho phép truy cập admin mà không cần đăng nhập
  // TODO: Bật lại kiểm tra auth khi deploy production

  if (loading) {
    return (
      <div className="app">
        <Header onTabChange={handleTabChange} activeTab="topics" />
        <main className="main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onTabChange={handleTabChange} activeTab="topics" />
      
      <main className="main">
        <div className="admin-page-container">
          {/* Admin Controls */}
          <div className="admin-controls">
            <button className="add-passage-btn" onClick={handleAddPassage}>
              + Thêm bài học mới
            </button>
            <button className="admin-panel-btn" onClick={() => navigate('/admin/panel')}>
              🔧 Admin Panel
            </button>
          </div>

          {/* Topic Selection */}
          <div className="admin-topic-selector">
            <div className="topic-tabs">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  className={`topic-tab ${selectedTopic?.id === topic.id ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic.slug === 'nature' ? '🌿' : topic.slug === 'travel' ? '✈️' : '🏠'} {topic.name || topic.title}
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
              onEdit={handleEditPassage}
              onDelete={handleDeletePassage}
              onManageVocab={handleManageVocab}
            />
          )}

          {/* Edit Passage Modal */}
          <PassageEditModal
            passage={editingPassage}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSavePassage}
          />

          {/* Vocabulary Management Modal */}
          <VocabManagementModal
            passage={managingVocabPassage}
            isOpen={isVocabModalOpen}
            onClose={handleCloseVocabModal}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;