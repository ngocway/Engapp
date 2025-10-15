import React, { useState, useEffect } from 'react';
import { Passage, PassageVocab } from '../types';
import { CambridgeDictionaryService } from '../services/cambridgeDictionaryService';
import { uploadImageToStorage, deleteImageFromStorage, validateImageFile, validateAudioFile, uploadVocabImage, uploadVocabAudio } from '../firebase/storageService';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVocab, setEditingVocab] = useState<PassageVocab | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [generatingSample, setGeneratingSample] = useState(false);

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
      pronunciation: '',
      image: '',
      partOfSpeech: '',
      example: ''
    };
    const newIndex = vocabList.length;
    setVocabList([...vocabList, newVocab]);
    // Tự động mở popup edit cho từ vựng mới
    setEditingIndex(newIndex);
    setEditingVocab({ ...newVocab });
    setShowEditModal(true);
  };

  const openEditModal = (index: number) => {
    const vocab = vocabList[index];
    setEditingIndex(index);
    setEditingVocab({ ...vocab });
    
    // Load existing uploaded files if any
    setUploadedImage(vocab.image || null);
    setUploadedAudio(vocab.audio || null);
    
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingIndex(null);
    setEditingVocab(null);
    setUploadedImage(null);
    setUploadedAudio(null);
  };

  const updateVocabField = (index: number, field: keyof PassageVocab, value: string) => {
    const newVocab = [...vocabList];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setVocabList(newVocab);
    
    console.log(`📝 Updated ${field} for index ${index}:`, value);
  };

  const updateEditingVocab = (field: keyof PassageVocab, value: string) => {
    if (editingVocab) {
      setEditingVocab({ ...editingVocab, [field]: value });
    }
  };

  // Function để lưu vocabulary vào database
  const saveVocabToDatabase = async (vocabListToSave: PassageVocab[]) => {
    try {
      setLoading(true);
      
      // Prepare vocabulary data for passage.vocab
      const cleanVocabList = vocabListToSave
        .filter(vocab => vocab.term.trim() !== '') // Only save non-empty terms
        .map(vocab => {
          const vocabData: PassageVocab = {
            term: vocab.term.trim(),
            meaning: vocab.meaning.trim(),
            definitionEn: vocab.definitionEn?.trim() || vocab.meaning.trim() // Use definitionEn if available, fallback to meaning
          };
          
          // Add phonetics if provided (ưu tiên phonetics object, fallback về pronunciation)
          if (vocab.phonetics) {
            vocabData.phonetics = vocab.phonetics;
          } else if (vocab.pronunciation && vocab.pronunciation.trim() !== '') {
            vocabData.phonetics = { us: vocab.pronunciation.trim() };
          }
          
          // Add image if provided
          if (vocab.image && vocab.image.trim() !== '') {
            vocabData.image = vocab.image.trim();
          }
          
          // Add part of speech if provided
          if (vocab.partOfSpeech && vocab.partOfSpeech.trim() !== '') {
            vocabData.partOfSpeech = vocab.partOfSpeech.trim();
          }
          
          // Add example if provided
          if (vocab.example && vocab.example.trim() !== '') {
            vocabData.example = vocab.example.trim();
          }
          
          // Add multiple examples if provided
          if (vocab.examples && vocab.examples.length > 0) {
            vocabData.examples = vocab.examples.filter(ex => ex.trim() !== '');
          }
          
          // Add audio if provided
          if (vocab.audio && vocab.audio.trim() !== '') {
            vocabData.audio = vocab.audio.trim();
          }
          
          console.log('💾 Preparing vocab:', vocabData);
          return vocabData;
        });
      
      // Update passage with new vocabulary
      const { passageService } = await import('../firebase/passageService');
      await passageService.update(passage!.id, { vocab: cleanVocabList });
      
      // Also save individual vocabulary items to vocabulary collection
      const { vocabularyService } = await import('../firebase/vocabularyService');
      for (const vocabData of cleanVocabList) {
        // Check if vocabulary already exists
        const existingVocab = await vocabularyService.getVocabularyByWord(vocabData.term);
        if (existingVocab) {
          // Update existing vocabulary
          await vocabularyService.updateVocabulary(existingVocab.id, vocabData);
          console.log(`✅ Updated vocabulary: ${vocabData.term}`);
        } else {
          // Add new vocabulary
          const vocabId = await vocabularyService.addVocabulary({
            word: vocabData.term,
            meaning: vocabData.meaning,
            pronunciation: vocabData.phonetics?.us || '',
            image: vocabData.image || '',
            audioUrl: vocabData.audio || '',
            example: vocabData.example || '',
            examples: vocabData.examples || [],
            partOfSpeech: vocabData.partOfSpeech || '',
            definitionEn: vocabData.definitionEn || ''
          });
          if (vocabId) {
            console.log(`✅ Added new vocabulary: ${vocabData.term} with ID: ${vocabId}`);
          }
        }
      }
      
      console.log('✅ Vocabulary saved to both passage.vocab and vocabulary collection successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving vocabulary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveEditChanges = async () => {
    if (editingIndex !== null && editingVocab) {
      try {
        const newVocabList = [...vocabList];
        const updatedVocab = { ...editingVocab };
        
        
        // Sử dụng ảnh đã upload nếu có
        if (uploadedImage) {
          updatedVocab.image = uploadedImage;
        }
        
        // Sử dụng audio đã upload nếu có
        if (uploadedAudio) {
          updatedVocab.audio = uploadedAudio;
        }
        
        newVocabList[editingIndex] = updatedVocab;
        setVocabList(newVocabList);
        
        // Lưu trực tiếp vào database
        await saveVocabToDatabase(newVocabList);
        
        alert('✅ Đã lưu từ vựng vào database thành công!');
        closeEditModal();
      } catch (error) {
        alert('❌ Lỗi khi lưu từ vựng vào database');
        console.error('Error in saveEditChanges:', error);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingVocab?.term) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to Firebase Storage
      const result = await uploadVocabImage(file, editingVocab.term);
      
      if (result.success && result.url) {
        setUploadedImage(result.url);
        // Cập nhật editingVocab với URL ảnh mới
        setEditingVocab({ ...editingVocab, image: result.url });
        console.log('✅ Image uploaded successfully:', result.url);
      } else {
        alert(`❌ Lỗi upload ảnh: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('❌ Lỗi khi upload ảnh lên Firebase Storage');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingVocab?.term) return;

    // Validate file
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingAudio(true);
    try {
      // Upload to Firebase Storage
      const result = await uploadVocabAudio(file, editingVocab.term);
      
      if (result.success && result.url) {
        setUploadedAudio(result.url);
        // Cập nhật editingVocab với URL audio mới
        setEditingVocab({ ...editingVocab, audio: result.url });
        console.log('✅ Audio uploaded successfully:', result.url);
      } else {
        alert(`❌ Lỗi upload audio: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      alert('❌ Lỗi khi upload audio lên Firebase Storage');
    } finally {
      setUploadingAudio(false);
    }
  };

  const generateSampleData = async () => {
    if (!editingVocab?.term) {
      alert('Vui lòng nhập từ vựng trước khi generate sample data');
      return;
    }

    try {
      setGeneratingSample(true);
      const sampleData = await CambridgeDictionaryService.generateSampleVocabData(editingVocab.term);
      
      if (sampleData) {
        // Update editing vocab with sample data
        const updatedVocab = {
          ...editingVocab,
          ...sampleData
        };
        
        setEditingVocab(updatedVocab);
        
        // Update uploaded files if provided
        if (sampleData.image) {
          setUploadedImage(sampleData.image);
        }
        if (sampleData.audio) {
          setUploadedAudio(sampleData.audio);
        }
        
        console.log(`✅ Đã generate sample data thành công! Từ: ${sampleData.term}, Nghĩa: ${sampleData.meaning}, Phát âm: ${sampleData.pronunciation}`);
      } else {
        console.error('❌ Không thể generate sample data');
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
    } finally {
      setGeneratingSample(false);
    }
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
      console.log('💾 Saving vocabulary for passage:', passage.title);
      
      // Sử dụng function saveVocabToDatabase đã tách riêng
      await saveVocabToDatabase(vocabList);
      
      alert('✅ Đã lưu từ vựng thành công!');
      onClose();
    } catch (error) {
      console.error('❌ Error saving vocabulary:', error);
      alert('❌ Lỗi khi lưu từ vựng');
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
                <button
                  type="button"
                  className="add-vocab-btn"
                  onClick={addVocabField}
                >
                  + Thêm từ vựng
                </button>
              </div>
              
              {vocabList.length === 0 ? (
                <div className="no-vocab-message">
                  <p>Chưa có từ vựng nào. Nhấn "Thêm từ vựng" để bắt đầu.</p>
                </div>
              ) : (
                <div className="vocab-list">
                  {vocabList.map((vocab, index) => (
                    <div key={index} className="vocab-item">
                      <div className="vocab-display">
                        {/* Thumbnail và từ vựng */}
                        <div 
                          className="vocab-thumbnail-container"
                          onClick={() => openEditModal(index)}
                          style={{ cursor: 'pointer' }}
                          title="Click để chỉnh sửa từ vựng"
                        >
                          <div className="vocab-thumbnail">
                            {vocab.image && vocab.image.trim() !== '' ? (
                              <img 
                                src={vocab.image} 
                                alt={vocab.term || 'Từ vựng'} 
                                className="vocab-thumbnail-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`vocab-thumbnail-placeholder ${vocab.image && vocab.image.trim() !== '' ? 'hidden' : ''}`}>
                              <span className="placeholder-icon">🖼️</span>
                              <span className="placeholder-text">Chưa có ảnh</span>
                            </div>
                          </div>
                          <div className="vocab-word">
                            {vocab.term || 'Từ vựng'}
                          </div>
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

      {/* Edit Vocab Popup Modal */}
      {showEditModal && editingVocab && (
        <div className="modal-overlay">
          <div className="modal-content vocab-edit-modal">
            <div className="modal-header">
              <h2>✏️ Chỉnh sửa từ vựng</h2>
              <button className="modal-close" onClick={closeEditModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-vocab-form">
                <div className="vocab-field">
                  <label>Ảnh đại diện:</label>
                  
                  {/* File Upload Option */}
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className={`file-upload-btn ${uploadingImage ? 'uploading' : ''}`}>
                      {uploadingImage ? '⏳ Đang upload...' : '📁 Chọn ảnh từ máy tính'}
                    </label>
                  </div>
                  
                  {/* URL Input Option */}
                  <div className="url-section">
                    <input
                      type="url"
                      value={editingVocab.image || ''}
                      onChange={(e) => updateEditingVocab('image', e.target.value)}
                      placeholder="Hoặc nhập URL ảnh từ internet"
                      className="image-url-input"
                    />
                  </div>
                  
                  {/* Preview image */}
                  {(uploadedImage || editingVocab.image) && (
                    <div className="image-preview">
                      <img 
                        src={uploadedImage || editingVocab.image} 
                        alt="Preview" 
                        className="preview-image" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setUploadedImage(null);
                          updateEditingVocab('image', '');
                        }}
                      >
                        ✕ Xóa ảnh
                      </button>
                    </div>
                  )}
                  
                  <small className="field-help">💡 Upload ảnh từ máy tính (jpg, png, gif, webp) hoặc nhập URL</small>
                </div>
                
                <div className="vocab-field">
                  <label>Từ vựng: <span style={{color: 'red'}}>*</span></label>
                  <div className="term-input-container">
                    <input
                      type="text"
                      value={editingVocab.term}
                      onChange={(e) => updateEditingVocab('term', e.target.value)}
                      placeholder="Nhập từ vựng"
                      className={`term-input ${editingVocab.term.trim() === '' ? 'required-field' : ''}`}
                    />
                    <button
                      type="button"
                      className="generate-sample-btn"
                      onClick={generateSampleData}
                      disabled={generatingSample || !editingVocab?.term}
                      title="Generate sample data cho từ vựng"
                    >
                      {generatingSample ? '🔄' : '✨'}
                    </button>
                  </div>
                  {editingVocab.term.trim() === '' && (
                    <small className="field-warning">⚠️ Trường này là bắt buộc</small>
                  )}
                  <small className="field-help">💡 Nhấn nút ✨ để tự động generate nghĩa, phát âm, ảnh, audio, ví dụ...</small>
                </div>
                
                <div className="vocab-field">
                  <label>Nghĩa: <span style={{color: 'red'}}>*</span></label>
                  <textarea
                    value={editingVocab.meaning}
                    onChange={(e) => updateEditingVocab('meaning', e.target.value)}
                    placeholder="Nhập nghĩa tiếng Việt"
                    rows={3}
                    className={`${editingVocab.meaning.trim() === '' ? 'required-field' : ''}`}
                  />
                  {editingVocab.meaning.trim() === '' && (
                    <small className="field-warning">⚠️ Trường này là bắt buộc</small>
                  )}
                </div>
                
                <div className="vocab-field">
                  <label>Phát âm (tùy chọn):</label>
                  <input
                    type="text"
                    value={editingVocab.pronunciation || editingVocab.phonetics?.us || ''}
                    onChange={(e) => {
                      const newVocab = { 
                        ...editingVocab, 
                        pronunciation: e.target.value,
                        phonetics: { us: e.target.value }
                      };
                      setEditingVocab(newVocab);
                    }}
                    placeholder="Ví dụ: /ˈwʊdən/ hoặc /mɪst/"
                  />
                  <small className="field-help">💡 Sử dụng ký hiệu IPA hoặc phiên âm tiếng Việt</small>
                </div>
                
                <div className="vocab-field">
                  <label>Định nghĩa tiếng Anh (tùy chọn):</label>
                  <textarea
                    value={editingVocab.definitionEn || ''}
                    onChange={(e) => updateEditingVocab('definitionEn', e.target.value)}
                    placeholder="Nhập định nghĩa tiếng Anh của từ vựng"
                    rows={2}
                  />
                  <small className="field-help">💡 Định nghĩa tiếng Anh giúp học viên hiểu rõ hơn về từ vựng</small>
                </div>
                
                <div className="vocab-field">
                  <label>Audio phát âm (tùy chọn):</label>
                  
                  
                  {/* File Upload Option */}
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="file-input"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className={`file-upload-btn ${uploadingAudio ? 'uploading' : ''}`}>
                      {uploadingAudio ? '⏳ Đang upload...' : '🎵 Chọn file audio từ máy tính'}
                    </label>
                  </div>
                  
                  {/* Preview audio */}
                  {(uploadedAudio || editingVocab.audio) && (
                    <div className="audio-preview">
                      <div className="audio-preview-header">
                        <span className="audio-label">🎵 Audio phát âm:</span>
                        <button 
                          type="button" 
                          className="remove-audio-btn"
                          onClick={() => {
                            setUploadedAudio(null);
                            updateEditingVocab('audio', '');
                          }}
                          title="Xóa audio"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="audio-player-container">
                        <div className="audio-controls">
                          <button
                            type="button"
                            className="play-audio-btn"
                            onClick={() => {
                              // Tìm audio element trong modal này
                              const modalAudio = document.querySelector('.vocab-edit-modal audio') as HTMLAudioElement;
                              if (modalAudio) {
                                modalAudio.play().catch(error => {
                                  console.error('❌ Error playing audio:', error);
                                  alert('❌ Không thể phát audio. Vui lòng kiểm tra file audio.');
                                });
                              } else {
                                console.error('❌ Audio element not found');
                                alert('❌ Không tìm thấy audio element');
                              }
                            }}
                          >
                            ▶️ Nghe thử
                          </button>
                          <audio 
                            key={uploadedAudio || editingVocab.audio} // Force re-render when audio changes
                            src={uploadedAudio || editingVocab.audio}
                            controls 
                            className="preview-audio"
                            preload="metadata"
                          >
                            Trình duyệt không hỗ trợ phát audio.
                          </audio>
                        </div>
                      </div>
                      <div className="audio-info">
                        <small>💡 Nhấn play để nghe thử audio đã upload</small>
                      </div>
                    </div>
                  )}
                  
                  <small className="field-help">💡 Upload file audio từ máy tính (mp3, wav, ogg) để phát âm từ vựng</small>
                </div>
                
                <div className="vocab-field">
                  <label>Loại từ (tùy chọn):</label>
                  <input
                    type="text"
                    value={editingVocab.partOfSpeech || ''}
                    onChange={(e) => updateEditingVocab('partOfSpeech', e.target.value)}
                    placeholder="Ví dụ: noun, verb, adjective"
                  />
                </div>
                
                <div className="vocab-field">
                  <label>Ví dụ (tùy chọn):</label>
                  
                  {/* Primary Example */}
                  <div className="example-section">
                    <label className="sub-label">Ví dụ chính:</label>
                    <textarea
                      value={editingVocab.example || ''}
                      onChange={(e) => updateEditingVocab('example', e.target.value)}
                      placeholder="Nhập câu ví dụ chính"
                      rows={2}
                      className="primary-example"
                    />
                  </div>
                  
                  {/* Multiple Examples */}
                  <div className="examples-section">
                    <div className="examples-header">
                      <label className="sub-label">Danh sách ví dụ:</label>
                      <button
                        type="button"
                        className="add-example-btn"
                        onClick={() => {
                          const currentExamples = editingVocab.examples || [];
                          const newExamples = [...currentExamples, ''];
                          setEditingVocab({ ...editingVocab, examples: newExamples });
                        }}
                        title="Thêm ví dụ mới"
                      >
                        + Thêm ví dụ
                      </button>
                    </div>
                    
                    <div className="examples-list">
                      {(editingVocab.examples || []).map((example, index) => (
                        <div key={index} className="example-item">
                          <div className="example-number">#{index + 1}</div>
                          <textarea
                            value={example}
                            onChange={(e) => {
                              const newExamples = [...(editingVocab.examples || [])];
                              newExamples[index] = e.target.value;
                              setEditingVocab({ ...editingVocab, examples: newExamples });
                            }}
                            placeholder={`Nhập ví dụ ${index + 1}`}
                            rows={2}
                            className="example-textarea"
                          />
                          <button
                            type="button"
                            className="remove-example-btn"
                            onClick={() => {
                              const newExamples = (editingVocab.examples || []).filter((_, i) => i !== index);
                              setEditingVocab({ ...editingVocab, examples: newExamples });
                            }}
                            title="Xóa ví dụ này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {(!editingVocab.examples || editingVocab.examples.length === 0) && (
                      <div className="no-examples-message">
                        <p>Chưa có ví dụ nào. Nhấn "Thêm ví dụ" để bắt đầu.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={closeEditModal}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={saveEditChanges}
                disabled={!editingVocab.term.trim() || !editingVocab.meaning.trim()}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabManagementModal;
