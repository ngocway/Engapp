import React, { useState } from 'react';
import Header from './Header';
import TopicsSection from './TopicsSection';
import ReviewPage from '../pages/ReviewPage';

type TabType = 'topics' | 'review';

interface MainLayoutProps {
  initialTab?: TabType;
}

const MainLayout: React.FC<MainLayoutProps> = ({ initialTab = 'topics' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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
    </div>
  );
};

export default MainLayout;
