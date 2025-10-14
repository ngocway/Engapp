import React, { useState, useEffect } from 'react';
import { Passage, EnglishLevel } from '../types';
import { passageService } from '../firebase/passageService';
import { vocabService } from '../firebase/vocabService';
import { settingsService, EnglishLevelOption } from '../firebase/settingsService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

interface PassageEditModalProps {
  passage: Passage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (passage: Passage) => void;
}

const PassageEditModal: React.FC<PassageEditModalProps> = ({ 
  passage, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    excerpt: '',
    topicSlug: '',
    thumbnail: '',
    audioUrl: ''
  });
  const [selectedEnglishLevels, setSelectedEnglishLevels] = useState<EnglishLevel[]>(['basic']);
  const [englishLevelOptions, setEnglishLevelOptions] = useState<EnglishLevelOption[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [vocabularyComparison, setVocabularyComparison] = useState<{
    newWords: string[];
    wordsToRemove: string[];
    wordsToKeep: string[];
  }>({
    newWords: [],
    wordsToRemove: [],
    wordsToKeep: []
  });

  // Load English Levels
  useEffect(() => {
    const loadEnglishLevels = async () => {
      try {
        setLevelsLoading(true);
        await settingsService.initializeDefaultSettings();
        const levels = await settingsService.getEnglishLevels();
        setEnglishLevelOptions(levels);
      } catch (error) {
        console.error('Error loading English levels:', error);
      } finally {
        setLevelsLoading(false);
      }
    };

    if (isOpen) {
      loadEnglishLevels();
    }
  }, [isOpen]);

  useEffect(() => {
    if (passage) {
      console.log('🔍 PassageEditModal - Loading passage data:', passage);
      console.log('🔍 PassageEditModal - Passage topicId:', passage.topicId);
      console.log('🔍 PassageEditModal - Passage topicSlug:', passage.topicSlug);
      
      setFormData({
        title: passage.title || '',
        text: passage.text || '',
        excerpt: passage.excerpt || '',
        topicSlug: passage.topicSlug || '',
        thumbnail: passage.thumbnail || '',
        audioUrl: passage.audioUrl || ''
      });
      setPreviewUrl(passage.thumbnail || '');
      setAudioPreviewUrl(passage.audioUrl || '');
      
      // Set English Levels
      if (passage.englishLevels && passage.englishLevels.length > 0) {
        setSelectedEnglishLevels(passage.englishLevels);
      } else if (passage.englishLevel) {
        setSelectedEnglishLevels([passage.englishLevel]);
      } else {
        setSelectedEnglishLevels(['basic']);
      }
      
    } else {
      setFormData({
        title: '',
        text: '',
        excerpt: '',
        topicSlug: '',
        thumbnail: '',
        audioUrl: ''
      });
      setPreviewUrl('');
      setAudioPreviewUrl('');
      setSelectedEnglishLevels(['basic']);
    }
    setSelectedFile(null);
    setSelectedAudioFile(null);
  }, [passage]);


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is selected
    }
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
      setFormData({ ...formData, audioUrl: '' }); // Clear URL when file is selected
    } else {
      alert('Vui lòng chọn file audio hợp lệ (MP3, WAV, etc.)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is dropped
    }
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
      setFormData({ ...formData, audioUrl: '' }); // Clear URL when file is dropped
    } else {
      alert('Vui lòng kéo thả file audio hợp lệ (MP3, WAV, etc.)');
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `passages/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      setUploading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      return null;
    }
  };

  const uploadAudio = async (file: File): Promise<string | null> => {
    try {
      const fileName = `passages/audio/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      setUploadingAudio(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadingAudio(false);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadingAudio(false);
      return null;
    }
  };

  // Function to extract vocabulary from text
  const extractVocabularyFromText = (text: string): string[] => {
    const bracketRegex = /\[([^\]]+)\]/g;
    const matches = text.match(bracketRegex);
    
    if (matches) {
      return matches.map(match => {
        const word = match.slice(1, -1).trim(); // Remove brackets and trim
        return word;
      }).filter(word => word.length > 0); // Filter out empty strings
    }
    
    return [];
  };

  // Function to get existing vocabulary from passage
  const getExistingVocabulary = async (): Promise<string[]> => {
    if (!passage) {
      return [];
    }
    
    try {
      // Get vocabulary from vocabService (linked to passage)
      const vocabularies = await vocabService.getByPassageId(passage.id);
      return vocabularies.map(vocab => vocab.term);
    } catch (error) {
      console.error('Error getting existing vocabulary:', error);
      return [];
    }
  };

  // Function to compare and categorize vocabulary
  const compareVocabulary = (detectedWords: string[], existingWords: string[]) => {
    const newWords = detectedWords.filter(word => !existingWords.includes(word));
    const wordsToRemove = existingWords.filter(word => !detectedWords.includes(word));
    const wordsToKeep = detectedWords.filter(word => existingWords.includes(word));

    return {
      newWords,
      wordsToRemove,
      wordsToKeep
    };
  };

  // English Level handlers
  const handleFormLevelChange = (level: EnglishLevel, checked: boolean) => {
    if (checked) {
      setSelectedEnglishLevels(prev => [...prev, level]);
    } else {
      setSelectedEnglishLevels(prev => prev.filter(l => l !== level));
    }
  };

  const clearFormLevels = () => {
    setSelectedEnglishLevels([]);
  };

  // Function to check for new vocabulary words
  const handleCheckVocabulary = async () => {
    if (!formData.text.trim()) {
      return;
    }

    setIsChecking(true);
    try {
      const detectedWords = extractVocabularyFromText(formData.text);
      const existingWords = await getExistingVocabulary();
      const comparison = compareVocabulary(detectedWords, existingWords);
      
      setDetectedWords(detectedWords);
      setVocabularyComparison(comparison);
    } catch (error) {
      console.error('Error checking vocabulary:', error);
    } finally {
      setIsChecking(false);
    }
  };


  // Function to update vocabulary for the passage
  const updatePassageVocabulary = async (passageId: string) => {
    try {
      console.log('📚 Auto-processing vocabulary from text...');
      
      // Extract vocabulary from current text
      const detectedWords = extractVocabularyFromText(formData.text);
      console.log('📚 Detected words from text:', detectedWords);
      
      if (detectedWords.length === 0) {
        console.log('📚 No vocabulary detected in text');
        return;
      }
      
      // Get current passage data to check existing vocab
      const { passageService } = await import('../firebase/passageService');
      const currentPassage = await passageService.getPassageById(passageId);
      
      if (!currentPassage) {
        console.error('❌ Could not load current passage');
        return;
      }
      
      const existingVocab = currentPassage.vocab || [];
      const existingTerms = existingVocab.map(vocab => vocab.term);
      
      console.log('📚 Existing vocabulary terms:', existingTerms);
      
      // Find new words to add
      const newWords = detectedWords.filter(word => !existingTerms.includes(word));
      
      // Find words to remove (words that were in vocab but not in text anymore)
      const wordsToRemove = existingTerms.filter(term => !detectedWords.includes(term));
      
      console.log('📚 New words to add:', newWords);
      console.log('📚 Words to remove:', wordsToRemove);
      
      // Prepare updated vocab list
      let updatedVocab = [...existingVocab];
      
      // Add new words
      newWords.forEach(word => {
        const newVocab = {
          term: word,
          meaning: `Nghĩa của ${word}`,
          definitionEn: `Definition of ${word}`
        };
        updatedVocab.push(newVocab);
        console.log('📚 Added new vocabulary:', newVocab);
      });
      
      // Remove words that are no longer in text
      updatedVocab = updatedVocab.filter(vocab => !wordsToRemove.includes(vocab.term));
      
      // Update passage with new vocabulary
      await passageService.update(passageId, { vocab: updatedVocab });
      
      console.log('✅ Vocabulary updated successfully:', {
        total: updatedVocab.length,
        added: newWords.length,
        removed: wordsToRemove.length,
        kept: updatedVocab.length - newWords.length
      });
      
    } catch (error) {
      console.error('❌ Error updating vocabulary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage) return;

    // Validate English Levels
    if (selectedEnglishLevels.length === 0) {
      alert('Vui lòng chọn ít nhất một English Level!');
      return;
    }

    console.log('🔄 Starting passage update...');
    console.log('📝 Passage ID:', passage.id);
    console.log('📝 Form data:', formData);
    console.log('📝 Selected English Levels:', selectedEnglishLevels);

    setLoading(true);
    try {
      let thumbnailUrl = formData.thumbnail;
      let audioUrl = formData.audioUrl;
      
      // Upload image file if selected
      if (selectedFile) {
        console.log('📤 Uploading image file...');
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
          console.log('✅ Image uploaded:', uploadedUrl);
        } else {
          alert('Lỗi khi upload ảnh. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      // Upload audio file if selected
      if (selectedAudioFile) {
        console.log('📤 Uploading audio file...');
        const uploadedAudioUrl = await uploadAudio(selectedAudioFile);
        if (uploadedAudioUrl) {
          audioUrl = uploadedAudioUrl;
          console.log('✅ Audio uploaded:', uploadedAudioUrl);
        } else {
          alert('Lỗi khi upload audio. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      // Prepare update data WITHOUT the id field (Firebase doesn't allow updating document ID)
      // Ensure topicId is not undefined
      const updateData = {
        title: formData.title,
        text: formData.text,
        excerpt: formData.excerpt,
        topicSlug: formData.topicSlug,
        thumbnail: thumbnailUrl,
        audioUrl: audioUrl,
        level: passage.level,
        englishLevel: selectedEnglishLevels[0] || 'basic', // Use first selected level for backward compatibility
        englishLevels: selectedEnglishLevels, // Save all selected levels
        topicId: passage.topicId || '' // Fallback to empty string if undefined
      };

      // Remove undefined values to prevent Firebase errors
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('💾 Updating passage in database...');
      console.log('💾 Update data (without id):', updateData);
      console.log('💾 Passage ID to update:', passage.id);

      // Update passage
      const updateResult = await passageService.update(passage.id, updateData);
      console.log('✅ Passage update result:', updateResult);
      
      // Update vocabulary (auto-processing from text)
      console.log('📚 Auto-processing vocabulary from text...');
      await updatePassageVocabulary(passage.id);
      console.log('✅ Vocabulary auto-processing completed');
      
      
      console.log('🎉 All updates completed successfully!');
      
      // Create the updated passage object for the callback (with id)
      const updatedPassage: Passage = {
        ...passage,
        ...updateData
      };
      
      onSave(updatedPassage);
      onClose();
      alert('Đã cập nhật đoạn văn và từ vựng thành công!');
    } catch (error) {
      console.error('❌ Error updating passage:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Lỗi khi cập nhật đoạn văn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✏️ Sửa đoạn văn</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề:</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Nhập tiêu đề đoạn văn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Tóm tắt:</label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Nhập tóm tắt ngắn gọn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="text">Nội dung:</label>
            <div className="text-input-container">
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={8}
                required
                placeholder="Nhập nội dung đoạn văn đầy đủ. Các từ mới nên được đặt trong ngoặc vuông [từ mới]"
              />
              <button
                type="button"
                className="check-vocabulary-button"
                onClick={handleCheckVocabulary}
                disabled={isChecking || !formData.text.trim()}
              >
                {isChecking ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra từ mới'}
              </button>
            </div>
            <div className="detected-words">
              <h4>
                {detectedWords.length > 0 
                  ? `Phân tích từ vựng (${detectedWords.length} từ phát hiện):`
                  : 'Chưa có từ mới nào được phát hiện'
                }
              </h4>
              
              {detectedWords.length > 0 ? (
                <div className="vocabulary-categories">
                  {/* Từ vựng mới */}
                  {vocabularyComparison.newWords.length > 0 && (
                    <div className="vocab-category new-words">
                      <h5 className="category-title new">
                        ➕ Từ vựng mới ({vocabularyComparison.newWords.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.newWords.map((word, index) => (
                          <span key={index} className="word-tag new">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Từ vựng giữ nguyên */}
                  {vocabularyComparison.wordsToKeep.length > 0 && (
                    <div className="vocab-category keep-words">
                      <h5 className="category-title keep">
                        ✅ Từ vựng giữ nguyên ({vocabularyComparison.wordsToKeep.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.wordsToKeep.map((word, index) => (
                          <span key={index} className="word-tag keep">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Từ vựng sẽ xóa */}
                  {vocabularyComparison.wordsToRemove.length > 0 && (
                    <div className="vocab-category remove-words">
                      <h5 className="category-title remove">
                        ❌ Từ vựng sẽ xóa ({vocabularyComparison.wordsToRemove.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.wordsToRemove.map((word, index) => (
                          <span key={index} className="word-tag remove">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-words-message">
                  Hãy đảm bảo các từ mới được đặt trong ngoặc vuông [từ mới] trong nội dung.
                </p>
              )}
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="topicSlug">Chủ đề:</label>
            <select
              id="topicSlug"
              value={formData.topicSlug}
              onChange={(e) => setFormData({ ...formData, topicSlug: e.target.value })}
              required
            >
              <option value="">Chọn chủ đề</option>
              <option value="nature">🌿 Thiên nhiên</option>
              <option value="daily-activities">🏠 Hoạt động hàng ngày</option>
              <option value="travel">✈️ Du lịch</option>
            </select>
          </div>

          <div className="form-group">
            <label>English Level:</label>
            <div className="form-level-checkboxes">
              {levelsLoading ? (
                <p>Đang tải levels...</p>
              ) : englishLevelOptions.length === 0 ? (
                <p>Không có level nào được tìm thấy.</p>
              ) : (
                <>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                    Đã tải {englishLevelOptions.length} levels. Đã chọn: {selectedEnglishLevels.length}
                  </p>
                  <div className="checkbox-list">
                    {englishLevelOptions.map((level) => (
                      <label 
                        key={level.id} 
                        className={`form-level-checkbox-inline ${selectedEnglishLevels.includes(level.key as EnglishLevel) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEnglishLevels.includes(level.key as EnglishLevel)}
                          onChange={(e) => handleFormLevelChange(level.key as EnglishLevel, e.target.checked)}
                        />
                        <span className="checkbox-label">{level.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="form-level-actions">
                    <button 
                      type="button" 
                      className="form-level-btn"
                      onClick={() => {
                        const allLevels = englishLevelOptions.map(level => level.key as EnglishLevel);
                        setSelectedEnglishLevels(allLevels);
                      }}
                    >
                      Chọn tất cả
                    </button>
                    <button 
                      type="button" 
                      className="form-level-btn"
                      onClick={clearFormLevels}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail:</label>
            
            {/* Upload Area */}
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                {uploading ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">📷</div>
                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <small>Hỗ trợ: JPG, PNG, GIF</small>
                  </div>
                )}
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                    setFormData({ ...formData, thumbnail: '' });
                  }}
                >
                  ✕ Xóa ảnh
                </button>
              </div>
            )}

            {/* URL Input */}
            <div className="url-input-group">
              <label htmlFor="thumbnail-url">Hoặc nhập URL ảnh:</label>
              <input
                id="thumbnail-url"
                type="url"
                value={formData.thumbnail}
                onChange={(e) => {
                  setFormData({ ...formData, thumbnail: e.target.value });
                  if (e.target.value) {
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Audio bài học:</label>
            
            {/* Audio Upload Area */}
            <div 
              className="upload-area audio-upload"
              onDragOver={handleDragOver}
              onDrop={handleAudioDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                className="file-input"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="upload-label">
                {uploadingAudio ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload audio...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">🎵</div>
                    <p>Kéo thả file audio vào đây hoặc click để chọn</p>
                    <small>Hỗ trợ: MP3, WAV, M4A</small>
                  </div>
                )}
              </label>
            </div>

            {/* Audio Preview */}
            {audioPreviewUrl && (
              <div className="audio-preview">
                <audio controls style={{ width: '100%', marginTop: '10px' }}>
                  <source src={audioPreviewUrl} type="audio/mpeg" />
                  <source src={audioPreviewUrl} type="audio/wav" />
                  <source src={audioPreviewUrl} type="audio/mp4" />
                  Trình duyệt không hỗ trợ audio.
                </audio>
                <button
                  type="button"
                  className="remove-audio"
                  onClick={() => {
                    setAudioPreviewUrl('');
                    setSelectedAudioFile(null);
                    setFormData({ ...formData, audioUrl: '' });
                  }}
                  style={{
                    marginTop: '5px',
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Xóa audio
                </button>
              </div>
            )}

            {/* Audio URL Input */}
            <div className="url-input-group">
              <label htmlFor="audio-url">Hoặc nhập URL audio:</label>
              <input
                id="audio-url"
                type="url"
                value={formData.audioUrl}
                onChange={(e) => {
                  setFormData({ ...formData, audioUrl: e.target.value });
                  if (e.target.value) {
                    setAudioPreviewUrl(e.target.value);
                    setSelectedAudioFile(null);
                  }
                }}
                placeholder="https://example.com/audio.mp3"
                disabled={!!selectedAudioFile}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-button cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="modal-button save"
              disabled={loading || uploading || uploadingAudio}
            >
              {loading ? 'Đang lưu...' : (uploading || uploadingAudio) ? 'Đang upload...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassageEditModal;