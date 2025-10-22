import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { Topic, Passage } from '../../types';
import PassageListComponent from '../../components/PassageList';
import PassageEditModal from '../../components/PassageEditModal';
import VocabManagementModal from '../../components/VocabManagementModal';
import AdminLogin from '../components/AdminLogin';
import { passageService } from '../../firebase/passageService';
import { topicService } from '../../firebase/topicService';
import { AdminUser } from '../../firebase/adminAuthService';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  console.log('🔍 AdminPage component rendering...');
  const navigate = useNavigate();
  // Admin page doesn't need user auth context
  const { admin, isAdminLoggedIn, login, logout, loading: adminLoading } = useAdmin();
  console.log('🔍 AdminPage state:', { admin, isAdminLoggedIn, adminLoading });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [managingVocabPassage, setManagingVocabPassage] = useState<Passage | null>(null);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [passageCounts, setPassageCounts] = useState<{[topicId: string]: number}>({});

  const logoSrc = '/logo192.png';

  // Remove handleTabChange since admin doesn't need user navigation

  useEffect(() => {
    console.log('🔍 useEffect - loadTopics called');
    loadTopics();
  }, []);

  useEffect(() => {
    // Mặc định chọn topic đầu tiên
    if (topics.length > 0 && !selectedTopic) {
      setSelectedTopic(topics[0]);
    }
    
    // Debug logs
    console.log('🔍 Debug - selectedTopic:', selectedTopic);
    console.log('🔍 Debug - passageCounts:', passageCounts);
    console.log('🔍 Debug - selectedTopic.id:', selectedTopic?.id);
    console.log('🔍 Debug - passageCounts[selectedTopic.id]:', selectedTopic ? passageCounts[selectedTopic.id] : 'N/A');
  }, [topics, selectedTopic, passageCounts]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      console.log('🔍 loadTopics - Starting to load topics...');
      const topicsData = await topicService.getAll();
      console.log('🔍 loadTopics - Topics data received:', topicsData);
      setTopics(topicsData);
      
      // Load passage counts for each topic
      await loadPassageCounts(topicsData);
      console.log('🔍 loadTopics - Completed successfully');
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      // Fallback to static data if Firebase fails
      const fallbackTopics = [
        { id: '1', title: 'Thiên nhiên', name: 'Thiên nhiên', slug: 'nature', thumbnail: '', description: 'Chủ đề về thiên nhiên', level: 1 },
        { id: '2', title: 'Hoạt động hàng ngày', name: 'Hoạt động hàng ngày', slug: 'daily-activities', thumbnail: '', description: 'Chủ đề về hoạt động hàng ngày', level: 1 },
        { id: '3', title: 'Du lịch', name: 'Du lịch', slug: 'travel', thumbnail: '', description: 'Chủ đề về du lịch', level: 1 }
      ];
      console.log('🔍 loadTopics - Using fallback topics:', fallbackTopics);
      setTopics(fallbackTopics);
      await loadPassageCounts(fallbackTopics);
    } finally {
      console.log('🔍 loadTopics - Setting loading to false');
      setLoading(false);
    }
  };

  const loadPassageCounts = async (topicsData: Topic[]) => {
    try {
      console.log('🔍 loadPassageCounts - topicsData:', topicsData);
      const counts: {[topicId: string]: number} = {};

      for (const topic of topicsData) {
        console.log('🔍 Processing topic:', topic.title, 'slug:', topic.slug);
        if (topic.slug) {
          // Add timeout for each passageService call
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Passage service timeout')), 3000)
          );
          
          const passagePromise = passageService.getByTopicSlug(topic.slug);
          const passages = await Promise.race([passagePromise, timeoutPromise]) as any;
          
          console.log('🔍 Passages for topic', topic.title, ':', passages.length, passages);
          counts[topic.id] = passages.length;
        } else {
          console.log('🔍 No slug for topic:', topic.title);
          counts[topic.id] = 0;
        }
      }

      console.log('🔍 Final passage counts:', counts);
      setPassageCounts(counts);
    } catch (error) {
      console.error('Error loading passage counts:', error);
      // Set default counts if there's an error
      const defaultCounts: {[topicId: string]: number} = {};
      topicsData.forEach(topic => {
        defaultCounts[topic.id] = 0;
      });
      setPassageCounts(defaultCounts);
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
    console.log('💾 Updated passage images count:', updatedPassage.images?.length || 0);
    console.log('💾 Updated passage images:', updatedPassage.images);
    try {
      // 🔄 CRITICAL: Update editingPassage state with the updated data
      setEditingPassage(updatedPassage);
      console.log('🔄 Updated editingPassage state with new data');
      
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
      topicSlug: selectedTopic?.slug || '',
      lessonType: 'passage', // Default to passage
      accessType: 'free'     // Default to free
    };
    setEditingPassage(newPassage);
    setIsEditModalOpen(true);
  };

  const handleAdminLoginSuccess = (adminUser: AdminUser) => {
    console.log('✅ Admin login successful in AdminPage:', adminUser);
    // The admin state is managed by AdminContext, so we don't need to do anything here
  };

  // Show admin login if not authenticated
  if (adminLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra quyền admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="app">
        <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
      </div>
    );
  }

  console.log('🔍 AdminPage render - loading state:', loading);
  if (loading) {
    console.log('🔍 AdminPage render - showing loading screen');
    return (
      <div className="admin-dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={logoSrc} alt="EngApp Logo" />
            <h2>EngApp</h2>
          </div>
          <nav className="sidebar-menu">
            <a href="#" className="menu-item active">
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </a>
            <a href="#" className="menu-item">
              <i className="fa-solid fa-book"></i> Bài học
            </a>
            <a href="#" className="menu-item">
              <i className="fa-solid fa-language"></i> Từ vựng
            </a>
            <a href="#" className="menu-item">
              <i className="fa-solid fa-user-gear"></i> Người dùng
            </a>
            <a href="#" className="menu-item">
              <i className="fa-solid fa-chart-line"></i> Thống kê
            </a>
          </nav>
          <button className="logout-sidebar" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </aside>
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoSrc} alt="EngApp Logo" />
          <h2>EngApp</h2>
        </div>

        <nav className="sidebar-menu">
          <a href="#" className="menu-item active">
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-book"></i> Bài học
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-language"></i> Từ vựng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-user-gear"></i> Người dùng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-chart-line"></i> Thống kê
          </a>
        </nav>

        <button className="logout-sidebar" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Category Filter */}
        <section className="category-filter">
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`filter-btn ${selectedTopic?.id === topic.id ? 'active' : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic.slug === 'nature' ? <i className="fa-solid fa-leaf"></i> : 
               topic.slug === 'travel' ? <i className="fa-solid fa-plane"></i> : 
               topic.slug === 'daily-activities' ? <i className="fa-solid fa-person-walking"></i> :
               <i className="fa-solid fa-flask"></i>} 
              {topic.name || topic.title}
            </button>
          ))}
        </section>

        {/* Lessons Section */}
        <section className="lesson-section">
          <div className="section-header">
            <h2>
              {selectedTopic?.slug === 'nature' ? <i className="fa-solid fa-leaf"></i> : 
               selectedTopic?.slug === 'travel' ? <i className="fa-solid fa-plane"></i> : 
               selectedTopic?.slug === 'daily-activities' ? <i className="fa-solid fa-person-walking"></i> :
               <i className="fa-solid fa-flask"></i>} 
              {selectedTopic?.name || selectedTopic?.title} 
              <span>({selectedTopic ? `${passageCounts[selectedTopic.id] || 0} bài học` : '0 bài học'})</span>
            </h2>
            <button className="primary-btn" onClick={handleAddPassage}>
              <i className="fa-solid fa-plus"></i> Thêm bài học mới
            </button>
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
        </section>

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
      </main>
    </div>
  );
};

export default AdminPage;