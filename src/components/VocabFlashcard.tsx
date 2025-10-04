import React, { useState, useEffect } from 'react';
import { PassageVocab } from '../types';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';

interface VocabFlashcardProps {
  term: string;
  passageVocab: PassageVocab[];
  onClose: () => void;
  position?: { x: number; y: number };
}

const VocabFlashcard: React.FC<VocabFlashcardProps> = ({ term, passageVocab, onClose, position }) => {
  const [vocab, setVocab] = useState<PassageVocab | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    loadVocab();
  }, [term, passageVocab]);

  const loadVocab = () => {
    setLoading(true);
    console.log('Looking for term:', term);
    console.log('Available passage vocab:', passageVocab);
    const found = passageVocab.find(v => v.term.toLowerCase() === term.toLowerCase());
    console.log('Found vocab:', found);
    setVocab(found || null);
    setLoading(false);
  };

  const speak = (text: string, voiceHint: 'uk' | 'us' | 'default' = 'default') => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const pick = voiceHint === 'uk'
        ? voices.find(v => /en-GB/i.test(v.lang))
        : voiceHint === 'us'
        ? voices.find(v => /en-US/i.test(v.lang))
        : undefined;
      if (pick) u.voice = pick;
      u.lang = pick?.lang || 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const setDifficulty = async (level: VocabDifficulty) => {
    if (vocab && user) {
      await userVocabService.setDifficulty(user.uid, vocab.term, level);
      onClose();
    }
  };

  if (loading) {
    const loadingStyle = position ? {
      position: 'fixed' as const,
      left: position.x - 100,
      top: position.y,
      transform: 'none'
    } : {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };

    return (
      <div style={{ 
        ...loadingStyle,
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 2000
      }}>
        <div style={{ textAlign: 'left' }}>🔄 Đang tải...</div>
      </div>
    );
  }

  if (!vocab) {
    const errorStyle = position ? {
      position: 'fixed' as const,
      left: position.x - 100,
      top: position.y,
      transform: 'none'
    } : {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };

    return (
      <div style={{ 
        ...errorStyle,
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 2000
      }}>
        <div style={{ textAlign: 'left' }}>Không tìm thấy từ "{term}"</div>
        <button className="button" onClick={onClose} style={{ marginTop: '10px' }}>Đóng</button>
      </div>
    );
  }

  const flashcardStyle = position ? {
    position: 'fixed' as const,
    left: position.x - 300, // Center the 600px wide card around the position
    top: position.y,
    transform: 'none'
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  return (
    <div 
      style={{ 
        ...flashcardStyle,
        width: 600,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: 12,
        zIndex: 2000
      }}
      onMouseLeave={onClose}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16, alignItems: 'start' }}>
        <div>
          <img 
            src={vocab.image || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop'} 
            alt={vocab.term} 
            style={{ width: '100%', height: 160, borderRadius: 8, objectFit: 'cover' }} 
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.src = 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop';
            }}
          />
          <div style={{ marginTop: 16, color: 'black', textAlign: 'left', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{capitalizeFirstLetter(vocab.term)}</span>
            {vocab.partOfSpeech && (
              <span style={{ fontSize: '1.1rem', fontWeight: 400 }}><em>({vocab.partOfSpeech})</em></span>
            )}
          </div>
          
          {/* Pronunciation Section */}
          <div style={{ 
            marginTop: 8, 
            width: '100%', 
            display: 'block',
            textAlign: 'left'
          }}>
            {/* Hiển thị pronunciation với ưu tiên US, nếu không có thì hiển thị UK */}
            {(vocab.phonetics?.us || vocab.phonetics?.uk) && (
              <div style={{ 
                display: 'inline-block',
                textAlign: 'left'
              }}>
                <button 
                  onClick={() => speak(vocab.term, vocab.phonetics?.us ? 'us' : 'uk')} 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#1976d2',
                    marginRight: '8px',
                    verticalAlign: 'middle'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
                <span style={{ 
                  color: 'black', 
                  fontStyle: 'italic',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  verticalAlign: 'middle'
                }}>
                  {vocab.phonetics?.us || vocab.phonetics?.uk}
                </span>
              </div>
            )}
          </div>
          
          {vocab.meaning && (
            <div style={{ color: 'black', marginTop: 8, fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
              {capitalizeFirstLetter(vocab.meaning)}
            </div>
          )}
          <div style={{ color: '#666', marginTop: 8, fontSize: '0.9rem', textAlign: 'left', fontStyle: 'italic' }}>
            Đây là nghĩa theo đoạn văn, xem thêm{' '}
            <a 
              href={`https://dictionary.cambridge.org/vi/dictionary/english/${vocab.term.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#1976d2', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              tại đây
            </a>
            {' '}để biết thêm các nghĩa khác
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: 'black', textAlign: 'left' }}>Definition:</div>
          <div style={{ fontSize: '1.05rem', marginBottom: 12, color: 'black', textAlign: 'left' }}>
            {vocab.definitionEn || 'No definition available'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: 'black', textAlign: 'left' }}>Examples:</div>
          <div style={{ marginTop: 4 }}>
            <ul style={{ paddingLeft: 18, margin: 0, textAlign: 'left' }}>
              {vocab.examples?.map((ex: string, i: number) => (
                <li key={i} style={{ marginBottom: 4, color: 'black', textAlign: 'left' }}>{ex}</li>
              ))}
              {(!vocab.examples || vocab.examples.length === 0) && (
                <li style={{ color: '#999', textAlign: 'left' }}>No examples available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
        {user ? (
          <>
            <button className="button" onClick={() => setDifficulty('easy')} style={{ background: '#55efc4', padding: '8px 12px' }}>Easy</button>
            <button className="button" onClick={() => setDifficulty('normal')} style={{ background: '#74b9ff', padding: '8px 12px' }}>Normal</button>
            <button className="button" onClick={() => setDifficulty('hard')} style={{ background: '#ff7675', padding: '8px 12px' }}>Hard</button>
          </>
        ) : (
          <div style={{ textAlign: 'left', color: 'black', fontSize: '0.9rem' }}>
            🔐 Đăng nhập để lưu độ khó từ vựng
          </div>
        )}
      </div>
    </div>
  );
};

export { VocabFlashcard };
