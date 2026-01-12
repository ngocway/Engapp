import React from 'react';
import { PassageVocab } from '../types';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';

interface VocabPopupProps {
  anchorRect: DOMRect | null;
  vocab: PassageVocab;
  onClose: () => void;
}

const VocabPopup: React.FC<VocabPopupProps> = ({ anchorRect, vocab, onClose }) => {
  // Make useAuth optional to prevent errors when not wrapped in AuthProvider
  let user: any = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    console.log('Auth context not available, continuing without user');
  }

  if (!anchorRect) return null;

  const speak = (text: string, voiceHint: 'uk' | 'us' | 'default' = 'default') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const pick = voiceHint === 'uk'
        ? voices.find(v => /en-GB/i.test(v.lang))
        : voiceHint === 'us'
          ? voices.find(v => /en-US/i.test(v.lang))
          : undefined;

      if (pick) u.voice = pick;
      u.lang = pick?.lang || (voiceHint === 'uk' ? 'en-GB' : 'en-US');
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const setDifficulty = async (level: VocabDifficulty) => {
    if (user) {
      await userVocabService.setDifficulty(user.uid, vocab.term, level);
    }
    onClose();
  };

  // Get examples array
  const examples = vocab.examples && vocab.examples.length > 0
    ? vocab.examples
    : (vocab.example ? [vocab.example] : []);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1024px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <span className="material-symbols-outlined text-primary">menu_book</span>
            </div>
            <h2 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight">Vocabulary Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8 mb-20 md:mb-24">
          {/* Left Column: Visuals & Stats */}
          <div className="flex-1 flex flex-col gap-6 md:max-w-[440px]">
            {/* 16:9 Image */}
            <div
              className="aspect-video w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-sm overflow-hidden"
              style={{
                backgroundImage: `url("${vocab.image || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=800&auto=format&fit=crop'}")`
              }}
            />

            {/* Mastery History Widget */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Mastery History</h3>
                <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Learning
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span className="text-xs font-medium uppercase tracking-wider">Seen</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1 time</p>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-sm">event</span>
                    <span className="text-xs font-medium uppercase tracking-wider">Last Activity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Today</p>
                </div>
              </div>

              {/* Progress visualization */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Retention Strength</span>
                  <span>New</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Linguistic Content */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  {vocab.term}
                </h1>
                {vocab.partOfSpeech && (
                  <span className="text-lg font-medium text-slate-400 dark:text-slate-500 italic">
                    {vocab.partOfSpeech}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 mt-2 flex-wrap">
                {/* UK Pronunciation */}
                {vocab.phonetics?.uk && (
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => speak(vocab.term, 'uk')}
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      UK
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-base">
                      /{vocab.phonetics.uk}/
                    </span>
                    <button className="text-primary hover:scale-110 transition-transform flex items-center">
                      <span className="material-symbols-outlined text-2xl">volume_up</span>
                    </button>
                  </div>
                )}

                {vocab.phonetics?.uk && vocab.phonetics?.us && (
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                )}

                {/* US Pronunciation */}
                {vocab.phonetics?.us && (
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => speak(vocab.term, 'us')}
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      US
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-base">
                      /{vocab.phonetics.us}/
                    </span>
                    <button className="text-primary hover:scale-110 transition-transform flex items-center">
                      <span className="material-symbols-outlined text-2xl">volume_up</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Definition & Examples Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
              <div className="space-y-6">
                {/* Definition */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">
                    Definition
                  </h3>
                  <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                    {vocab.explanationEn || vocab.definitionEn || vocab.meaning || 'No definition available'}
                  </p>
                </div>

                {/* Examples */}
                {examples.length > 0 && (
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">
                      Examples
                    </h3>
                    <ul className="space-y-4">
                      {examples.map((ex, i) => (
                        <li key={i} className="flex gap-4 text-slate-600 dark:text-slate-300 italic text-base">
                          <span className="text-primary font-bold">“</span>
                          <span className="leading-relaxed">{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-fit px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-xl flex items-center gap-1">
          <div className="px-3 md:px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Mastery:
          </div>
          <button
            onClick={() => setDifficulty('easy')}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold text-xs md:text-sm text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined text-sm">new_releases</span>
            <span className="hidden sm:inline">New</span>
          </button>
          <button
            onClick={() => setDifficulty('normal')}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold text-xs md:text-sm text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            <span className="hidden sm:inline">Learning</span>
          </button>
          <button
            onClick={() => setDifficulty('hard')}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all font-semibold text-xs md:text-sm"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span className="hidden sm:inline">Mastered</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabPopup;
