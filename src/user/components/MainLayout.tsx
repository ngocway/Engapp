import React, { useState } from 'react';
import Header from './Header';
import TopicsSection from './TopicsSection';
import ReviewPage from '../pages/ReviewPage';
import { useAuth } from '../contexts/AuthContext';
import LoginRequiredModal from './LoginRequiredModal';

type TabType = 'topics' | 'review';

interface MainLayoutProps {
  initialTab?: TabType;
}

const MainLayout: React.FC<MainLayoutProps> = ({ initialTab = 'topics' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, login } = useAuth();

  const handleTabChange = (tab: TabType) => {
    // Kiểm tra login khi chuyển sang tab review
    if (tab === 'review' && !user) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleLoginClick = () => {
    setShowLoginModal(false);
    login();
  };

  return (
    <div className="app background">
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      
      <main className="main">
        {activeTab === 'topics' ? (
          <TopicsSection />
        ) : (
          <ReviewPage />
        )}
      </main>
      
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
        title="🔒 Chức năng Premium"
        description="Chức năng Ôn tập chỉ dành cho thành viên, vui lòng đăng nhập để có thể lưu tiến trình học tập của bạn."
        loginButtonIcon="🔑"
        loginButtonText="Đăng nhập ngay"
      />
    </div>
  );
};

export default MainLayout;
