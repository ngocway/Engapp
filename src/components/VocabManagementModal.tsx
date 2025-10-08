import React, { useState, useEffect } from 'react';
import { Passage, PassageVocab } from '../types';

interface VocabManagementModalProps {
  passage: Passage | null;
  isOpen: boolean;
  onClose: () => void;
}

const VocabManagementModal: React.FC<VocabManagementModalProps> = ({
  passage,
  isOpen,
  onClose
}) => {
  const [vocabList, setVocabList] = useState<PassageVocab[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (passage && isOpen) {
      loadVocabList();
    } else {
      setVocabList([]);
    }
  }, [passage, isOpen]);

  const loadVocabList = async () => {
    if (!passage) return;
    
    try {
      setLoading(true);
      console.log('📚 Loading vocabulary for passage:', passage.title);
      console.log('📚 Passage vocab data:', passage.vocab);
      console.log('📚 Passage ID:', passage.id);
      
      // Load vocabulary directly from passage.vocab
      let vocabData = passage.vocab || [];
      
      // If no vocab in passage, try to load from database (fallback)
      if (vocabData.length === 0) {
        console.log('📚 No vocab in passage, trying to load from database...');
        const { passageService } = await import('../firebase/passageService');
        const freshPassage = await passageService.getPassageById(passage.id);
        if (freshPassage && freshPassage.vocab) {
          vocabData = freshPassage.vocab;
          console.log('📚 Found vocab in fresh passage:', vocabData);
        } else {
          console.log('📚 No vocab field found in database, initializing empty array');
          // Initialize empty vocab field in database if it doesn't exist
          try {
            await passageService.update(passage.id, { vocab: [] });
            console.log('📚 Initialized empty vocab field in database');
          } catch (error) {
            console.error('❌ Failed to initialize vocab field:', error);
          }
        }
      }
      
      setVocabList(vocabData);
      console.log('📚 Final vocab data:', vocabData);
      console.log('📚 VocabList length:', vocabData.length);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      setVocabList([]);
    } finally {
      setLoading(false);
    }
  };

  const addVocabField = () => {
    const newVocab: PassageVocab = {
      term: '',
      meaning: '',
      pronunciation: ''
    };
    setVocabList([...vocabList, newVocab]);
    // Tự động chuyển sang chế độ edit cho từ vựng mới
    setEditingIndex(vocabList.length);
  };

  const toggleEditMode = (index: number) => {
    if (editingIndex === index) {
      // Đang edit, chuyển về chế độ xem
      setEditingIndex(null);
    } else {
      // Chuyển sang chế độ edit
      setEditingIndex(index);
    }
  };

  const updateVocabField = (index: number, field: keyof PassageVocab, value: string) => {
    const newVocab = [...vocabList];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setVocabList(newVocab);
    
    console.log(`📝 Updated ${field} for index ${index}:`, value);
  };


  const validateVocabList = () => {
    const errors: string[] = [];
    
    vocabList.forEach((vocab, index) => {
      if (vocab.term.trim() === '') {
        errors.push(`Từ vựng thứ ${index + 1}: Thiếu từ vựng`);
      }
      if (vocab.meaning.trim() === '') {
        errors.push(`Từ vựng thứ ${index + 1}: Thiếu nghĩa`);
      }
    });
    
    return errors;
  };

  const handleSaveAndClose = async () => {
    // Đóng tất cả chế độ edit trước khi lưu
    setEditingIndex(null);
    
    // Validate và lưu
    await handleSave();
  };

  const handleSave = async () => {
    if (!passage) return;
    
    // Validate before saving
    const validationErrors = validateVocabList();
    if (validationErrors.length > 0) {
      alert('Vui lòng điền đầy đủ thông tin:\n' + validationErrors.join('\n'));
      return;
    }
    
    try {
      setLoading(true);
      console.log('💾 Saving vocabulary for passage:', passage.title);
      
      // Prepare vocabulary data for passage.vocab
      const cleanVocabList = vocabList
        .filter(vocab => vocab.term.trim() !== '') // Only save non-empty terms
        .map(vocab => {
          const vocabData: PassageVocab = {
            term: vocab.term.trim(),
            meaning: vocab.meaning.trim(),
            definitionEn: vocab.meaning.trim() // Use meaning as definition for now
          };
          
          // Add phonetics if provided
          if (vocab.pronunciation && vocab.pronunciation.trim() !== '') {
            vocabData.phonetics = { us: vocab.pronunciation.trim() };
          }
          
          console.log('💾 Preparing vocab:', vocabData);
          return vocabData;
        });
      
      // Update passage with new vocabulary
      const { passageService } = await import('../firebase/passageService');
      await passageService.update(passage.id, { vocab: cleanVocabList });
      
      console.log('✅ Vocabulary saved to passage.vocab successfully');
      alert('Đã lưu từ vựng thành công!');
      onClose();
    } catch (error) {
      console.error('❌ Error saving vocabulary:', error);
      alert('Lỗi khi lưu từ vựng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !passage) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content vocab-management-modal">
        <div className="modal-header">
          <h2>📚 Quản lý từ vựng - {passage.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && vocabList.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải từ vựng...</p>
            </div>
          ) : (
            <>
              <div className="vocab-header">
                <span>Danh sách từ vựng ({vocabList.length})</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="add-vocab-btn"
                    onClick={addVocabField}
                  >
                    + Thêm từ vựng
                  </button>
                  <button
                    type="button"
                    style={{ background: '#ffc107', color: 'black', padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                    onClick={() => {
                      console.log('🔍 DEBUG - Passage data:', passage);
                      console.log('🔍 DEBUG - VocabList:', vocabList);
                      alert(`Debug: Passage has vocab field: ${!!passage?.vocab}, VocabList length: ${vocabList.length}`);
                    }}
                  >
                    DEBUG
                  </button>
                  <button
                    type="button"
                    style={{ background: '#28a745', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                    onClick={async () => {
                      try {
                        console.log('🔧 INIT - Creating vocab field for passage:', passage?.id);
                        const { passageService } = await import('../firebase/passageService');
                        await passageService.update(passage!.id, { vocab: [] });
                        console.log('✅ INIT - Vocab field created successfully');
                        alert('Đã tạo field vocab thành công! Vui lòng đóng và mở lại modal.');
                        // Reload the modal
                        loadVocabList();
                      } catch (error) {
                        console.error('❌ INIT - Failed to create vocab field:', error);
                        alert('Lỗi khi tạo field vocab');
                      }
                    }}
                  >
                    INIT
                  </button>
                </div>
              </div>
              
              {vocabList.length === 0 ? (
                <div className="no-vocab-message">
                  <p>Chưa có từ vựng nào. Nhấn "Thêm từ vựng" để bắt đầu.</p>
                </div>
              ) : (
                <div className="vocab-list">
                  {vocabList.map((vocab, index) => (
                    <div key={index} className="vocab-item">
                      <div className="vocab-item-header">
                        <span className="vocab-index">#{index + 1}</span>
                        <button
                          type="button"
                          className="edit-vocab-btn"
                          onClick={() => toggleEditMode(index)}
                          title={editingIndex === index ? "Hoàn thành chỉnh sửa" : "Chỉnh sửa từ vựng"}
                        >
                          {editingIndex === index ? "✅" : "✏️"}
                        </button>
                      </div>
                      
                      <div className="vocab-fields">
                        <div className="vocab-field">
                          <label>Từ vựng:</label>
                          <input
                            type="text"
                            value={vocab.term}
                            onChange={(e) => updateVocabField(index, 'term', e.target.value)}
                            placeholder="Nhập từ vựng"
                            readOnly={editingIndex !== index}
                            className={`${vocab.term.trim() === '' ? 'required-field' : ''} ${editingIndex !== index ? 'readonly-field' : ''}`}
                          />
                          {vocab.term.trim() === '' && editingIndex === index && (
                            <small className="field-warning">⚠️ Trường này là bắt buộc</small>
                          )}
                        </div>
                        <div className="vocab-field">
                          <label>Nghĩa:</label>
                          <textarea
                            value={vocab.meaning}
                            onChange={(e) => updateVocabField(index, 'meaning', e.target.value)}
                            placeholder="Nhập nghĩa tiếng Việt"
                            rows={2}
                            readOnly={editingIndex !== index}
                            className={`${vocab.meaning.trim() === '' ? 'required-field' : ''} ${editingIndex !== index ? 'readonly-field' : ''}`}
                          />
                          {vocab.meaning.trim() === '' && editingIndex === index && (
                            <small className="field-warning">⚠️ Trường này là bắt buộc</small>
                          )}
                        </div>
                        <div className="vocab-field">
                          <label>Phát âm (tùy chọn):</label>
                          <input
                            type="text"
                            value={vocab.pronunciation || vocab.phonetics?.us || ''}
                            onChange={(e) => {
                              const newVocab = [...vocabList];
                              newVocab[index] = { 
                                ...newVocab[index], 
                                pronunciation: e.target.value,
                                phonetics: { us: e.target.value }
                              };
                              setVocabList(newVocab);
                            }}
                            placeholder="Ví dụ: /ˈwʊdən/ hoặc /mɪst/"
                            readOnly={editingIndex !== index}
                            className={editingIndex !== index ? 'readonly-field' : ''}
                          />
                          {editingIndex === index && (
                            <small className="field-help">💡 Sử dụng ký hiệu IPA hoặc phiên âm tiếng Việt</small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="vocab-info">
                <p><small>💡 Từ vựng sẽ được lưu vào database và hiển thị cho học viên.</small></p>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSaveAndClose}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu từ vựng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabManagementModal;
