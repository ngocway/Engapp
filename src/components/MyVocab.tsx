import React, { useEffect, useState } from 'react';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';
import { passageService } from '../firebase/passageService';
import { PassageVocab } from '../types';
import MiniVocabCard from './MiniVocabCard';

interface MyVocabProps {
  onBack: () => void;
}

const sections: { key: VocabDifficulty; title: string; color: string }[] = [
  { key: 'easy', title: 'Easy', color: '#55efc4' },
  { key: 'normal', title: 'Normal', color: '#74b9ff' },
  { key: 'hard', title: 'Hard', color: '#ff7675' }
];

const MyVocab: React.FC<MyVocabProps> = ({ onBack }) => {
  const [data, setData] = useState<Record<VocabDifficulty, string[]>>({ easy: [], normal: [], hard: [] });
  const [allVocabs, setAllVocabs] = useState<PassageVocab[]>([]);
  const [activeTab, setActiveTab] = useState<VocabDifficulty>('easy');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (user) {
        setLoading(true);
        try {
          // Load user vocab data và all vocabs từ passages
          const [grouped, passages] = await Promise.all([
            userVocabService.getAll(user.uid),
            passageService.getAll()
          ]);
          
          // Extract all vocabs from passages
          const allVocabsFromPassages: PassageVocab[] = [];
          passages.forEach(passage => {
            if (passage.vocab && passage.vocab.length > 0) {
              allVocabsFromPassages.push(...passage.vocab);
            }
          });
          
          setData(grouped);
          setAllVocabs(allVocabsFromPassages);
        } catch (error) {
          console.error('Error loading vocab data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <h3>🔐 Vui lòng đăng nhập</h3>
          <p>Bạn cần đăng nhập để xem từ vựng đã học</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: 40 }}>🔄 Đang tải từ vựng...</div>
      </div>
    );
  }

  // Helper function để lấy PassageVocab từ term
  const getVocabByTerm = (term: string): PassageVocab | null => {
    return allVocabs.find(v => v.term.toLowerCase() === term.toLowerCase()) || null;
  };

  // Helper function để lấy danh sách PassageVocab cho tab hiện tại
  const getVocabsForTab = (tab: VocabDifficulty): PassageVocab[] => {
    return data[tab]
      .map(term => getVocabByTerm(term))
      .filter((vocab): vocab is PassageVocab => vocab !== null);
  };

  return (
    <div className="main-content" style={{ margin: '20px auto' }}>
      <div className="sentence-section" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <h2 className="section-title">📁 Từ vựng của tôi</h2>
        
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveTab(section.key)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === section.key ? section.color : 'transparent',
                color: activeTab === section.key ? 'white' : section.color,
                borderRadius: '8px 8px 0 0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === section.key ? `3px solid ${section.color}` : '3px solid transparent'
              }}
            >
              <span style={{ marginRight: '8px' }}>
                {section.key === 'easy' ? '🟢' : section.key === 'normal' ? '🔵' : '🔴'}
              </span>
              {section.title} ({data[section.key].length})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          minHeight: '400px'
        }}>
          {getVocabsForTab(activeTab).length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '16px'
            }}>
              {getVocabsForTab(activeTab).map((vocab, index) => (
                <MiniVocabCard key={`${vocab.term}-${index}`} vocab={vocab} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {activeTab === 'easy' ? '🟢' : activeTab === 'normal' ? '🔵' : '🔴'}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>
                Chưa có từ vựng nào
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                Hãy đọc các đoạn văn và phân loại từ vựng để xem chúng ở đây!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVocab;




