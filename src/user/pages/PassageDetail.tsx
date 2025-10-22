import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { passageService } from '../../firebase/passageService';
import { Passage } from '../../types';
import PassageDetailComponent from '../../components/PassageDetail';
import Header from '../components/Header';

const PassageDetail: React.FC = () => {
  const { id: passageId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPassage = async () => {
      if (passageId) {
        try {
          console.log('🔍 Loading passage with ID:', passageId);
          console.log('🔍 Passage ID type:', typeof passageId);
          console.log('🔍 Passage ID length:', passageId.length);
          
          // First, let's test if we can get all passages
          console.log('🔍 Testing getAll() first...');
          const allPassages = await passageService.getAll();
          console.log('🔍 All passages from Firebase:', allPassages.length);
          console.log('🔍 Available passage IDs:', allPassages.map(p => p.id));
          
          // Check if our passage ID exists in the list
          const passageExists = allPassages.some(p => p.id === passageId);
          console.log('🔍 Does passage ID exist in all passages?', passageExists);
          
          // Use the direct getPassageById method
          const foundPassage = await passageService.getPassageById(passageId);
          console.log('🔍 Found passage result:', foundPassage);
          
          if (foundPassage) {
            console.log('✅ Passage loaded successfully:', foundPassage.title);
            console.log('✅ Passage audioUrl:', foundPassage.audioUrl);
            setPassage(foundPassage);
          } else {
            console.log('❌ Passage not found for ID:', passageId);
            console.log('❌ Available passages:', allPassages.map(p => ({ id: p.id, title: p.title })));
            console.log('❌ Navigating to topics...');
            navigate('/topics');
          }
        } catch (error) {
          console.error('❌ Error loading passage:', error);
          console.error('❌ Error details:', error);
          navigate('/topics');
        }
      } else {
        console.log('❌ No passageId provided');
        navigate('/topics');
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
        <PassageDetailComponent 
          passage={passage}
          onBack={() => navigate('/')}
        />
      </main>
    </div>
  );
};

export default PassageDetail;
