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
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!passage) {
    return <div>Passage not found</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* HEADER */}
      <header className="bg-card-light dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">school</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EngApp</span>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <span className="px-4 py-2 bg-primary text-white font-medium rounded-full text-sm cursor-pointer" onClick={() => navigate('/topics')}>Topics</span>
              <span className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-primary transition-colors text-sm cursor-pointer" onClick={() => navigate('/review')}>Practice</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Basic
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <img alt="Vietnam Flag" className="w-4 h-3 object-cover rounded-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnw8s4Nab-NBGpew43oYk-NmNVIY84wajiTPi_Z6zbO2gCWMFE9JujOom0TkNZLvxsgZuGdKbyFro3oDhohNcgsblejHp-SaTnInb91NZaeWVInBNUcWGIf4mGBSl2MUTD_-mEpmSYSNAYiTsPyKlr0g7vVdSFohFIUXZnsUDDUEVtFdl0ejY9YqaG9oGbSew6NOkjv8ZGkgDod9mAnnumVSAd9ThHRCRZrRPD_lrYOtXjAXxcTRVmCOgTgu1HNDDxg7ERl0FVZIrj" />
                Tiếng Việt
                <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
              </div>
            </div>
            <button
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              onClick={() => navigate('/topics')}
            >
              Start
            </button>
            <button
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">dark_mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <PassageDetailComponent
        passage={passage}
        onBack={() => navigate('/')}
      />

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="w-6 h-6 bg-slate-400 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">school</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">EngApp</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 EngApp. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PassageDetail;
