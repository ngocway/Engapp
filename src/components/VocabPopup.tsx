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
  const { user } = useAuth();
  
  if (!anchorRect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.bottom + 8,
    left: Math.min(anchorRect.left, window.innerWidth - 620),
    width: 600,
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    padding: 12,
    zIndex: 2000
  };

  const speak = (text: string, voiceHint: 'uk' | 'us' | 'default' = 'default') => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      // Try pick a voice by locale hint
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
    if (user) {
      await userVocabService.setDifficulty(user.uid, vocab.term, level);
    }
    onClose();
  };

  return (
    <div style={style} onMouseLeave={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          {(
            <img 
              src={vocab.image || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop'} 
              alt={vocab.term} 
              style={{ width: '100%', height: 160, borderRadius: 8, objectFit: 'cover' }} 
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.src = 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop';
              }}
            />
          )}
          <div style={{ marginTop: 16, fontSize: '2rem', fontWeight: 800 }}>{vocab.term}</div>
          {vocab.partOfSpeech && (
            <div style={{ color: '#636e72', marginTop: 2 }}><em>{vocab.partOfSpeech}</em></div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ color: '#636e72' }}>{vocab.pronunciation || ''}</span>
            {vocab.phonetics?.uk && <span style={{ color: '#636e72' }}>UK {vocab.phonetics.uk}</span>}
            {vocab.phonetics?.us && <span style={{ color: '#636e72' }}>US {vocab.phonetics.us}</span>}
            <button className="button" onClick={() => speak(vocab.term, 'uk')} style={{ padding: '6px 10px' }}>UK 🔊</button>
            <button className="button" onClick={() => speak(vocab.term, 'us')} style={{ padding: '6px 10px' }}>US 🔊</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="button" onClick={() => setDifficulty('easy')} style={{ background: '#55efc4', padding: '8px 12px' }}>Easy</button>
            <button className="button" onClick={() => setDifficulty('normal')} style={{ background: '#74b9ff', padding: '8px 12px' }}>Normal</button>
            <button className="button" onClick={() => setDifficulty('hard')} style={{ background: '#ff7675', padding: '8px 12px' }}>Hard</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Definition:</div>
          <div style={{ fontSize: '1.05rem', marginBottom: 12 }}>
            {vocab.explanationEn || vocab.definitionEn || vocab.meaning || 'No definition available'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Examples:</div>
          <div style={{ marginTop: 4 }}>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {(vocab.examples && vocab.examples.length > 0 ? vocab.examples : (vocab.example ? [vocab.example] : []))
                .map((ex, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{ex}</li>
                ))}
              {(!vocab.examples || vocab.examples.length === 0) && (!vocab.example) && (
                <li style={{ color: '#999' }}>No examples available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabPopup;


