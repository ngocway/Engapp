import React, { useState, useEffect } from 'react';
import { PassageVocab } from '../types';
import { userVocabService, VocabDifficulty } from '../firebase/userVocabService';
import { useAuth } from '../contexts/AuthContext';

interface VocabFlashcardProps {
  term: string;
  passageVocab: PassageVocab[];
  onClose: () => void;
  position?: { x: number; y: number };
  isPracticeMode?: boolean;
  onPracticeEnd?: () => void;
}

const VocabFlashcard: React.FC<VocabFlashcardProps> = ({ term, passageVocab, onClose, position, isPracticeMode = false, onPracticeEnd }) => {
  const [vocab, setVocab] = useState<PassageVocab | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    loadVocab();
  }, [term, passageVocab, currentIndex]);

  const loadVocab = () => {
    setLoading(true);
    setImageLoading(true); // Reset image loading state
    
    if (isPracticeMode && passageVocab.length > 0) {
      // In practice mode, use currentIndex to get the current word
      const currentWord = passageVocab[currentIndex];
      setVocab(currentWord || null);
    } else {
      // Normal mode: find by term
      const found = passageVocab.find(v => v.term.toLowerCase() === term.toLowerCase());
      setVocab(found || null);
    }
    
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
      
      if (isPracticeMode) {
        // Add to completed words
        setCompletedWords(prev => [...prev, vocab.term]);
        
        // Move to next word or finish practice
        if (currentIndex < passageVocab.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // Practice finished
          if (onPracticeEnd) {
            onPracticeEnd();
          }
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  const goToNextWord = () => {
    if (currentIndex < passageVocab.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    const loadingStyle = position ? {
      position: 'fixed' as const,
      left: position.x,
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
        background: '#f8f9fa',
        padding: position ? '16px' : '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 2000,
        width: position ? '200px' : 'auto'
      }}>
        <div style={{ textAlign: 'left' }}>🔄 Đang tải...</div>
      </div>
    );
  }

  if (!vocab) {
    const errorStyle = position ? {
      position: 'fixed' as const,
      left: position.x,
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
        background: '#f8f9fa',
        padding: position ? '16px' : '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 2000,
        width: position ? '250px' : 'auto'
      }}>
        <div style={{ textAlign: 'left' }}>Không tìm thấy từ "{term}"</div>
        <button className="button" onClick={onClose} style={{ marginTop: '10px' }}>Đóng</button>
      </div>
    );
  }

  const flashcardStyle = position ? {
    position: 'fixed' as const,
    left: position.x, // Use the calculated x position directly
    top: position.y, // Use the calculated y position directly
    transform: 'none',
    maxWidth: '850px',
    maxHeight: 'none',
    overflow: 'visible',
    zIndex: 2000
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '850px',
    maxHeight: 'none',
    overflow: 'visible',
    zIndex: 2000
  };

  return (
    <div 
      style={{ 
        ...flashcardStyle,
        width: 850,
        background: '#f8f9fa',
        borderRadius: 20,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseLeave={!isPracticeMode ? onClose : undefined}
    >
      {/* Practice Mode Header */}
      {isPracticeMode && (
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#495057' 
            }}>
              🎯 Ôn tập từ vựng
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6c757d' 
            }}>
              {currentIndex + 1} / {passageVocab.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${((currentIndex + 1) / passageVocab.length) * 100}%`, 
              height: '100%', 
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            gap: '8px'
          }}>
            <button
              onClick={goToPreviousWord}
              disabled={currentIndex === 0}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: currentIndex === 0 ? '#e9ecef' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.5 : 1
              }}
            >
              ← Trước
            </button>
            
            <button
              onClick={() => {
                if (onPracticeEnd) {
                  onPracticeEnd();
                }
                onClose();
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Kết thúc
            </button>
            
            <button
              onClick={goToNextWord}
              disabled={currentIndex === passageVocab.length - 1}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: currentIndex === passageVocab.length - 1 ? '#e9ecef' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentIndex === passageVocab.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === passageVocab.length - 1 ? 0.5 : 1
              }}
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Main Content - 2 columns */}
      <div style={{ 
        display: 'flex', 
        flex: 1 
      }}>
        {/* Left Column */}
        <div style={{ 
          flex: 1,
          background: '#f8f9fa',
          padding: '24px'
        }}>
          <div style={{ 
            position: 'relative',
            width: '100%', 
            height: '200px', 
            borderRadius: 12, 
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            {/* Loading overlay */}
            {imageLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: 12
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    Đang tải ảnh...
                  </span>
                </div>
              </div>
            )}
            
            <img 
              src={vocab.image || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop'} 
              alt={vocab.term} 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: 12, 
                objectFit: 'cover',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                opacity: imageLoading ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.src = 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop';
                setImageLoading(false);
              }}
            />
          </div>
          
          <div style={{ 
            marginTop: 0
          }}>
            <h2 style={{ 
              fontSize: '26px',
              fontWeight: 700,
              marginBottom: '4px',
              color: '#0f172a'
            }}>
              {capitalizeFirstLetter(vocab.term)} 
              {vocab.partOfSpeech && (
                <span style={{ 
                  fontSize: '16px',
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  {' '}({vocab.partOfSpeech})
                </span>
              )}
            </h2>

            {/* Audio Section */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '8px 0'
            }}>
              <button 
                onClick={() => {
                  if (vocab.audio && (vocab.audio.startsWith('data:audio/') || vocab.audio.startsWith('http'))) {
                    const audio = new Audio(vocab.audio);
                    audio.play().catch(() => speak(vocab.term, vocab.phonetics?.us ? 'us' : 'uk'));
                  } else {
                    speak(vocab.term, vocab.phonetics?.us ? 'us' : 'uk');
                  }
                }}
                style={{ 
                  background: 'linear-gradient(145deg, #2563eb, #1e3a8a)',
                  border: 'none',
                  color: 'white',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)',
                  transition: 'transform 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <i className="fa-solid fa-volume-high"></i>
              </button>
              <span style={{ 
                fontSize: '14px',
                color: '#2563eb',
                fontWeight: 500
              }}>
                Nghe phát âm
              </span>
            </div>

            {/* Pronunciation */}
            {(vocab.phonetics?.us || vocab.phonetics?.uk || vocab.pronunciation) && (
              <p style={{ 
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#475569',
                margin: '6px 0'
              }}>
                {(() => {
                  const pronunciationText = vocab.phonetics?.us || vocab.phonetics?.uk || vocab.pronunciation;
                  if (!pronunciationText) return '';
                  let cleanText = pronunciationText.replace(/^\/+|\/+$/g, '');
                  return `/${cleanText}/`;
                })()}
              </p>
            )}

            {/* Meaning */}
            {vocab.meaning && (
              <p style={{ 
                fontSize: '16px',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                <strong>{capitalizeFirstLetter(vocab.meaning)}</strong>
              </p>
            )}

            {/* Note */}
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '6px'
            }}>
              Đây là nghĩa theo đoạn văn. Xem thêm{' '}
              <a 
                href={`https://dictionary.cambridge.org/vi/dictionary/english/${vocab.term.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                tại đây
              </a>
              {' '}để biết thêm các nghĩa khác.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ 
          flex: 1.2,
          padding: '28px',
          background: '#f9fafb'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '6px'
          }}>
            Definition
          </h3>
          <p style={{ 
            fontSize: '15px',
            color: '#334155',
            lineHeight: 1.6,
            marginBottom: '14px'
          }}>
            {vocab.definitionEn || 'No definition available'}
          </p>

          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '6px'
          }}>
            Examples
          </h3>
          <ul style={{ 
            margin: 0,
            paddingLeft: '20px',
            fontSize: '15px',
            color: '#475569',
            lineHeight: 1.8
          }}>
            {vocab.examples?.map((ex: string, i: number) => (
              <li key={i} style={{ 
                marginBottom: '4px'
              }}>
                {ex}
              </li>
            ))}
            {(!vocab.examples || vocab.examples.length === 0) && (
              <li style={{ color: '#999' }}>No examples available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer with buttons */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-evenly',
        padding: '14px 0',
        background: '#f8f9fa',
        borderTop: '1px solid #e2e8f0'
      }}>
        {user ? (
          <>
            <button 
              onClick={() => setDifficulty('easy')} 
              style={{ 
                flex: 1,
                maxWidth: '160px',
                fontWeight: 600,
                border: 'none',
                color: 'white',
                borderRadius: '10px',
                padding: '10px 0',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontSize: '15px',
                background: '#22c55e'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Easy
            </button>
            <button 
              onClick={() => setDifficulty('normal')} 
              style={{ 
                flex: 1,
                maxWidth: '160px',
                fontWeight: 600,
                border: 'none',
                color: 'white',
                borderRadius: '10px',
                padding: '10px 0',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontSize: '15px',
                background: '#3b82f6'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Normal
            </button>
            <button 
              onClick={() => setDifficulty('hard')} 
              style={{ 
                flex: 1,
                maxWidth: '160px',
                fontWeight: 600,
                border: 'none',
                color: 'white',
                borderRadius: '10px',
                padding: '10px 0',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontSize: '15px',
                background: '#ef4444'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Hard
            </button>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '14px',
            padding: '10px 0'
          }}>
            🔐 Đăng nhập để lưu độ khó từ vựng
          </div>
        )}
      </div>
    </div>
  );
};

export { VocabFlashcard };
