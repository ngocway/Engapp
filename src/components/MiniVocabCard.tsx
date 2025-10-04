import React from 'react';
import { PassageVocab } from '../types';

interface MiniVocabCardProps {
  vocab: PassageVocab;
}

const MiniVocabCard: React.FC<MiniVocabCardProps> = ({ vocab }) => {
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minHeight: '80px',
      transition: 'transform 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }}
    >
      {/* Ảnh từ vựng */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <img 
          src={vocab.image || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop'} 
          alt={vocab.term}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Thông tin từ vựng */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Từ vựng và cách đọc */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#333',
            lineHeight: 1.2
          }}>
            {vocab.term}
          </h3>
          
          {/* Nút phát âm */}
          <button
            onClick={() => speak(vocab.term)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#666',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
            }}
          >
            🔊
          </button>
        </div>

        {/* Cách đọc */}
        {vocab.phonetics && (
          <div style={{
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '4px',
            fontFamily: 'monospace'
          }}>
            {vocab.phonetics.uk && `UK: ${vocab.phonetics.uk}`}
            {vocab.phonetics.uk && vocab.phonetics.us && ' • '}
            {vocab.phonetics.us && `US: ${vocab.phonetics.us}`}
          </div>
        )}

        {/* Nghĩa tiếng Việt */}
        <div style={{
          fontSize: '1rem',
          color: '#007bff',
          fontWeight: '500'
        }}>
          {vocab.meaning || 'Chưa có nghĩa tiếng Việt'}
        </div>
      </div>
    </div>
  );
};

export default MiniVocabCard;

