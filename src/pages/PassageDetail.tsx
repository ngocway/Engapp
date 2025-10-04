import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { passageService } from '../firebase/passageService';
import { Passage } from '../types';
import PassageDetailComponent from '../components/PassageDetail';

const PassageDetail: React.FC = () => {
  const { passageId } = useParams<{ passageId: string }>();
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPassage = async () => {
      if (passageId) {
        try {
          console.log('Loading passage with ID:', passageId);
          const allPassages = await passageService.getAll();
          console.log('All passages from Firebase:', allPassages);
          
          const foundPassage = allPassages.find(p => p.id === passageId);
          console.log('Found passage:', foundPassage);
          
          if (foundPassage) {
            console.log('Passage audioUrl:', foundPassage.audioUrl);
            setPassage(foundPassage);
          } else {
            console.log('Passage not found, navigating to topics');
            navigate('/topics');
          }
        } catch (error) {
          console.error('Error loading passage:', error);
          navigate('/topics');
        }
      }
      setLoading(false);
    };

    loadPassage();
  }, [passageId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!passage) {
    return <div>Passage not found</div>;
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
        <PassageDetailComponent 
          passage={passage}
          onBack={() => {}}
        />
      </main>
    </div>
  );
};

export default PassageDetail;
