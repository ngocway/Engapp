import React, { useState, useEffect } from 'react';
import { Passage, Topic, EnglishLevel } from '../../types';
import { passageService } from '../../firebase/passageService';
import { topicService } from '../../firebase/topicService';
import { settingsService, EnglishLevelOption } from '../../firebase/settingsService';

interface AdminPassageManagerProps {
  onClose: () => void;
}

const AdminPassageManager: React.FC<AdminPassageManagerProps> = ({ onClose }) => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedLevels, setSelectedLevels] = useState<EnglishLevel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);
  const [englishLevelOptions, setEnglishLevelOptions] = useState<EnglishLevelOption[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to display English Level
  const getEnglishLevelDisplay = (englishLevel?: EnglishLevel, level?: number): string => {
    if (englishLevel) {
      const levelMap = {
        'kids-2-4': '👶 Kids 2-4',
        'kids-5-10': '🧒 Kids 5-10',
        'basic': '🌱 Basic',
        'independent': '🌿 Independent',
        'proficient': '🌳 Proficient'
      };
      return levelMap[englishLevel] || englishLevel;
    }
    return 'A' + (level || 1);
  };

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    text: '',
    topicId: '',
    topicSlug: '',
    level: 1,
    englishLevel: 'basic' as EnglishLevel,
    audioUrl: '',
    thumbnail: '',
    youtubeUrl: '',
    vocab: [] as any[],
    layoutRatio: '4:6' as '4:6' | '5:5'
  });
  
  // Selected English Levels for form
  const [selectedEnglishLevels, setSelectedEnglishLevels] = useState<EnglishLevel[]>(['basic']);

  useEffect(() => {
    loadData();
    loadEnglishLevels();
  }, []);

  const loadEnglishLevels = async () => {
    try {
      setLevelsLoading(true);
      // Initialize default settings if needed
      await settingsService.initializeDefaultSettings();
      
      // Load English levels
      const levels = await settingsService.getEnglishLevels();
      setEnglishLevelOptions(levels);
    } catch (error) {
      console.error('Error loading English levels:', error);
    } finally {
      setLevelsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [passagesData, topicsData] = await Promise.all([
        passageService.getAll(),
        topicService.getAll()
      ]);
      setPassages(passagesData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredPassages = passages.filter(passage => {
    // Filter by topic
    const matchesTopic = !selectedTopic || passage.topicSlug === selectedTopic;
    
    // Filter by English Level
    const matchesLevel = selectedLevels.length === 0 || 
      (passage.englishLevel && selectedLevels.includes(passage.englishLevel)) ||
      (!passage.englishLevel && selectedLevels.includes('basic')); // fallback for old passages
    
    return matchesTopic && matchesLevel;
  });

  const handleAddPassage = () => {
    setFormData({
      title: '',
      excerpt: '',
      text: '',
      topicId: '',
      topicSlug: selectedTopic || '',
      level: 1,
      englishLevel: 'basic' as EnglishLevel,
      audioUrl: '',
      thumbnail: '',
      youtubeUrl: '',
      vocab: [],
      layoutRatio: '4:6' as '4:6' | '5:5'
    });
    setSelectedEnglishLevels(['basic']);
    setEditingPassage(null);
    setShowAddForm(true);
  };

  const handleEditPassage = (passage: Passage) => {
    setFormData({
      title: passage.title,
      excerpt: passage.excerpt || '',
      text: passage.text,
      topicId: passage.topicId,
      topicSlug: passage.topicSlug || '',
      level: passage.level,
      englishLevel: passage.englishLevel || 'basic',
      audioUrl: passage.audioUrl || '',
      thumbnail: passage.thumbnail || '',
      youtubeUrl: '',
      vocab: passage.vocab || [],
      layoutRatio: passage.layoutRatio || '4:6'
    });
    setSelectedEnglishLevels(passage.englishLevel ? [passage.englishLevel] : ['basic']);
    setEditingPassage(passage);
    setShowAddForm(true);
  };

  const handleDeletePassage = async (passageId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài học này?')) {
      try {
        // For now, we'll just remove from local state since delete method doesn't exist
        // TODO: Add delete method to passageService
        setPassages(passages.filter(p => p.id !== passageId));
        alert('Đã xóa bài học thành công! (Chỉ xóa khỏi giao diện, chưa xóa khỏi database)');
      } catch (error) {
        console.error('Error deleting passage:', error);
        alert('Lỗi khi xóa bài học');
      }
    }
  };

  // Function to extract vocabulary from text (words in brackets [])
  const extractVocabularyFromText = (text: string): string[] => {
    const bracketRegex = /\[([^\]]+)\]/g;
    const matches = text.match(bracketRegex);
    
    if (!matches) return [];
    
    const vocabularyWords = matches.map(match => {
      const word = match.slice(1, -1).trim(); // Remove brackets
      return word;
    }).filter(word => word.length > 0);
    
    // Remove duplicates
    return Array.from(new Set(vocabularyWords));
  };

  // Function to get existing vocabulary from passage
  const getExistingVocabulary = async (passageId: string): Promise<string[]> => {
    try {
      console.log('🔍 getExistingVocabulary - passageId:', passageId);
      
      // Get current passage data
      const currentPassage = await passageService.getPassageById(passageId);
      console.log('🔍 getExistingVocabulary - currentPassage:', currentPassage);
      
      if (!currentPassage) {
        console.log('🔍 getExistingVocabulary - No passage found');
        return [];
      }
      
      // Get vocabulary from passage.vocab
      const existingVocab = currentPassage.vocab || [];
      console.log('🔍 getExistingVocabulary - existingVocab:', existingVocab);
      
      const terms = existingVocab.map(vocab => vocab.term);
      console.log('🔍 getExistingVocabulary - terms:', terms);
      
      return terms;
    } catch (error) {
      console.error('❌ Error getting existing vocabulary:', error);
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

  // Function to process vocabulary from text and save to passage.vocab
  const processVocabularyFromText = async (passageId: string, text: string) => {
    try {
      console.log('📚 Auto-processing vocabulary from text...');
      
      const detectedWords = extractVocabularyFromText(text);
      console.log('📚 Detected words from text:', detectedWords);
      
      // Get existing vocabulary
      const existingWords = await getExistingVocabulary(passageId);
      console.log('📚 Existing vocabulary:', existingWords);
      
      // Compare and categorize
      const comparison = compareVocabulary(detectedWords, existingWords);
      console.log('📚 Vocabulary comparison:', comparison);
      
      // Get current passage to update vocab
      const currentPassage = await passageService.getPassageById(passageId);
      if (!currentPassage) {
        console.error('❌ Could not load current passage');
        return;
      }
      
      let updatedVocab = [...(currentPassage.vocab || [])];
      
      // Add new words
      comparison.newWords.forEach(word => {
        const newVocab = {
          term: word,
          meaning: `Nghĩa của ${word}`,
          definitionEn: `Definition of ${word}`
        };
        updatedVocab.push(newVocab);
        console.log('📚 Added new vocabulary:', newVocab);
      });
      
      // Remove words that are no longer in text
      updatedVocab = updatedVocab.filter(vocab => !comparison.wordsToRemove.includes(vocab.term));
      
      // Update passage with vocabulary
      await passageService.update(passageId, { vocab: updatedVocab });
      
      console.log('✅ Vocabulary processed and saved:', {
        total: updatedVocab.length,
        added: comparison.newWords.length,
        removed: comparison.wordsToRemove.length,
        kept: comparison.wordsToKeep.length,
        vocab: updatedVocab
      });
      
    } catch (error) {
      console.error('❌ Error processing vocabulary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one English level is selected
    if (selectedEnglishLevels.length === 0) {
      alert('Vui lòng chọn ít nhất một English Level!');
      return;
    }
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài học!');
      return;
    }
    
    if (!formData.text.trim()) {
      alert('Vui lòng nhập nội dung bài học!');
      return;
    }
    
    if (!formData.topicSlug) {
      alert('Vui lòng chọn chủ đề!');
      return;
    }
    
    setSaving(true);
    
    try {
      console.log('💾 Bắt đầu lưu bài học...');
      console.log('📝 Dữ liệu form:', {
        title: formData.title,
        topicSlug: formData.topicSlug,
        textLength: formData.text.length,
        englishLevel: selectedEnglishLevels,
        vocabCount: formData.vocab.length
      });
      
      // Use the first selected level as primary level (for backward compatibility)
      const primaryLevel = selectedEnglishLevels[0];
      const passageData = {
        ...formData,
        englishLevel: primaryLevel
      };
      
      if (editingPassage) {
        console.log('✏️ Cập nhật bài học có sẵn:', editingPassage.id);
        // Update existing passage
        await passageService.update(editingPassage.id, passageData);
        console.log('✅ Đã cập nhật bài học vào database');
        
        // Auto-process vocabulary from text
        console.log('📚 Xử lý từ vựng tự động...');
        await processVocabularyFromText(editingPassage.id, formData.text);
        
        setPassages(passages.map(p => 
          p.id === editingPassage.id ? { ...p, ...passageData } : p
        ));
        
        // Show detailed success message
        const detectedWords = extractVocabularyFromText(formData.text);
        let successMessage = `✅ Đã cập nhật bài học thành công!\n\n📚 Từ vựng đã được xử lý tự động: ${detectedWords.length} từ`;
        alert(successMessage);
      } else {
        console.log('🆕 Tạo bài học mới...');
        // Add new passage
        const newPassage = await passageService.add(passageData);
        if (newPassage) {
          console.log('✅ Đã tạo bài học mới với ID:', newPassage);
          
          // Auto-process vocabulary from text
          console.log('📚 Xử lý từ vựng tự động...');
          await processVocabularyFromText(newPassage, formData.text);
          
          setPassages([...passages, { ...passageData, id: newPassage }]);
          
          // Show detailed success message
          const detectedWords = extractVocabularyFromText(formData.text);
          let successMessage = `✅ Đã thêm bài học thành công!\n\n📚 Từ vựng đã được xử lý tự động: ${detectedWords.length} từ`;
          alert(successMessage);
        } else {
          throw new Error('Không thể tạo bài học mới');
        }
      }
      
      console.log('🎉 Hoàn thành lưu bài học!');
      setShowAddForm(false);
      setEditingPassage(null);
    } catch (error) {
      console.error('❌ Lỗi khi lưu bài học:', error);
      const errorMessage = error instanceof Error ? error.message : 'Vui lòng thử lại';
      alert(`Lỗi khi lưu bài học: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleVocabChange = (index: number, value: string) => {
    const newVocab = [...formData.vocab];
    newVocab[index] = { term: value, meaning: '' };
    setFormData({ ...formData, vocab: newVocab });
  };

  const addVocabField = () => {
    setFormData({ ...formData, vocab: [...formData.vocab, { term: '', meaning: '' }] });
  };

  const removeVocabField = (index: number) => {
    const newVocab = formData.vocab.filter((_, i) => i !== index);
    setFormData({ ...formData, vocab: newVocab });
  };

  // Handle level filter checkbox changes
  const handleLevelFilterChange = (level: EnglishLevel, checked: boolean) => {
    if (checked) {
      setSelectedLevels(prev => [...prev, level]);
    } else {
      setSelectedLevels(prev => prev.filter(l => l !== level));
    }
  };

  // Clear all level filters
  const clearLevelFilters = () => {
    setSelectedLevels([]);
  };

  // Select all level filters
  const selectAllLevelFilters = () => {
    const allLevels = englishLevelOptions.map(level => level.key as EnglishLevel);
    setSelectedLevels(allLevels);
  };

  // Handle English Level checkbox changes in form
  const handleFormLevelChange = (level: EnglishLevel, checked: boolean) => {
    if (checked) {
      setSelectedEnglishLevels(prev => [...prev, level]);
    } else {
      setSelectedEnglishLevels(prev => prev.filter(l => l !== level));
    }
  };

  // Clear all selected English levels in form
  const clearFormLevels = () => {
    setSelectedEnglishLevels([]);
  };

  // Select single level in form (for single selection mode)
  const selectSingleLevel = (level: EnglishLevel) => {
    setSelectedEnglishLevels([level]);
  };

  if (loading) {
    return (
      <div className="admin-passage-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="admin-passage-manager">
        <div className="admin-header">
          <h2>{editingPassage ? 'Sửa bài học' : 'Thêm bài học mới'}</h2>
          <button className="close-button" onClick={() => setShowAddForm(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="passage-form">
          <div className="form-group">
            <label>Tiêu đề bài học:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề đoạn văn"
              required
            />
          </div>

          <div className="form-group">
            <label>Tóm tắt:</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Nhập tóm tắt ngắn gọn"
            />
          </div>

          {/* Dropdown chọn tỷ lệ layout - vị trí màu vàng */}
          <div className="form-group">
            <label>Tỷ lệ layout:</label>
            <select
              value={formData.layoutRatio}
              onChange={(e) => setFormData({ ...formData, layoutRatio: e.target.value as '4:6' | '5:5' })}
            >
              <option value="4:6">4:6 (Cột trái nhỏ hơn - Video 40%, Nội dung 60%)</option>
              <option value="5:5">5:5 (Cột bằng nhau - Video 50%, Nội dung 50%)</option>
            </select>
            <small style={{ color: '#666', fontSize: '0.9em', marginTop: '4px', display: 'block' }}>
              💡 Chọn tỷ lệ hiển thị giữa video/từ vựng và nội dung bài học
            </small>
          </div>

          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              placeholder="Nhập nội dung đoạn văn đầy đủ. Các từ mới nên đặt trong ngoặc vuông [từ mới]"
              required
            />
            <button 
              type="button" 
              onClick={async () => {
                if (!formData.text.trim()) {
                  alert('Vui lòng nhập nội dung trước khi kiểm tra từ mới');
                  return;
                }

                try {
                  // Extract vocabulary from text
                  const detectedWords = extractVocabularyFromText(formData.text);
                  
                  if (detectedWords.length === 0) {
                    alert('Chưa có từ mới nào được phát hiện trong nội dung. Hãy đảm bảo các từ mới được đặt trong ngoặc vuông [từ mới]');
                    return;
                  }

                  // Get existing vocabulary if editing
                  let existingWords: string[] = [];
                  console.log('🔍 Debug - editingPassage:', editingPassage);
                  console.log('🔍 Debug - formData.vocab:', formData.vocab);
                  
                  if (editingPassage) {
                    console.log('🔍 Đang edit bài học có sẵn, lấy từ vựng cũ...');
                    console.log('🔍 editingPassage.id:', editingPassage.id);
                    existingWords = await getExistingVocabulary(editingPassage.id);
                    console.log('🔍 Từ vựng cũ từ database:', existingWords);
                    console.log('🔍 Số lượng từ vựng cũ:', existingWords.length);
                  } else {
                    console.log('🔍 Đang tạo bài học mới hoặc không có editingPassage');
                    // Nếu có từ vựng trong form, sử dụng để so sánh
                    if (formData.vocab && formData.vocab.length > 0) {
                      existingWords = formData.vocab.map(vocab => vocab.term).filter(term => term);
                      console.log('🔍 Sử dụng từ vựng từ form để so sánh:', existingWords);
                    }
                  }

                  // Compare vocabulary
                  const comparison = compareVocabulary(detectedWords, existingWords);
                  console.log('🔍 Kết quả so sánh:', comparison);

                  // Create detailed message
                  let message = `📚 Phân tích từ vựng (${detectedWords.length} từ phát hiện):\n\n`;
                  
                  if (editingPassage && existingWords.length > 0) {
                    message += `📖 Từ vựng hiện tại trong bài học (${existingWords.length}): ${existingWords.join(', ')}\n\n`;
                  }
                  
                  if (comparison.newWords.length > 0) {
                    message += `➕ Từ vựng sẽ thêm (${comparison.newWords.length}): ${comparison.newWords.join(', ')}\n`;
                  }
                  
                  if (comparison.wordsToKeep.length > 0) {
                    message += `✅ Từ vựng không đổi (${comparison.wordsToKeep.length}): ${comparison.wordsToKeep.join(', ')}\n`;
                  }
                  
                  if (comparison.wordsToRemove.length > 0) {
                    message += `❌ Từ vựng sẽ xóa (${comparison.wordsToRemove.length}): ${comparison.wordsToRemove.join(', ')}\n`;
                  }

                  // Show different messages for new vs editing
                  if (!editingPassage) {
                    message += `\n🆕 Đây là bài học mới, tất cả ${detectedWords.length} từ sẽ được thêm vào từ vựng.`;
                    message += `\n💡 Sau khi lưu bài học, lần tới khi edit sẽ thấy phân loại "từ giữ nguyên" vs "từ mới".`;
                  } else if (comparison.wordsToRemove.length > 0) {
                    message += `\n⚠️ Lưu ý: ${comparison.wordsToRemove.length} từ sẽ bị xóa khỏi từ vựng của bài học vì không còn xuất hiện trong nội dung.`;
                  }

                  alert(message);
                } catch (error) {
                  console.error('Error checking vocabulary:', error);
                  alert('Có lỗi xảy ra khi kiểm tra từ vựng');
                }
              }}
              style={{ marginTop: '8px', padding: '4px 8px', fontSize: '0.9em' }}
            >
              🔍 Kiểm tra từ mới
            </button>
          </div>

          <div className="form-group">
            <label>Chủ đề:</label>
            <select
              value={formData.topicSlug}
              onChange={(e) => {
                const selectedTopic = topics.find(t => t.slug === e.target.value);
                setFormData({ 
                  ...formData, 
                  topicSlug: e.target.value,
                  topicId: selectedTopic?.id || ''
                });
              }}
              required
            >
              <option value="">Chọn chủ đề</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.slug}>
                  {topic.name || topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>English Level:</label>
            <div className="form-level-checkboxes">
              {levelsLoading ? (
                <p>Đang tải levels... (Loading: {levelsLoading.toString()})</p>
              ) : englishLevelOptions.length === 0 ? (
                <p>Không có level nào được tìm thấy. (Count: {englishLevelOptions.length})</p>
              ) : (
                <>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                    Đã tải {englishLevelOptions.length} levels. Đã chọn: {selectedEnglishLevels.length}
                  </p>
                  <div className="checkbox-grid">
                    {englishLevelOptions.map((level) => (
                      <label 
                        key={level.id} 
                        className={`form-level-checkbox ${selectedEnglishLevels.includes(level.key as EnglishLevel) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEnglishLevels.includes(level.key as EnglishLevel)}
                          onChange={(e) => handleFormLevelChange(level.key as EnglishLevel, e.target.checked)}
                        />
                        <div className="checkbox-content">
                          <span className="checkbox-icon">{level.icon}</span>
                          <span className="checkbox-label">{level.label}</span>
                        </div>
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
            <label>URL Audio:</label>
            <input
              type="url"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>URL Hình ảnh:</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>URL YouTube:</label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="form-group">
            <label>Từ vựng:</label>
            {formData.vocab.map((vocab, index) => (
              <div key={index} className="vocab-input-group">
                <input
                  type="text"
                  value={vocab.term || ''}
                  onChange={(e) => handleVocabChange(index, e.target.value)}
                  placeholder="Nhập từ vựng"
                />
                <button type="button" onClick={() => removeVocabField(index)}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addVocabField} className="add-vocab-btn">
              + Thêm từ vựng
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowAddForm(false)}>
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Đang lưu...' : (editingPassage ? 'Cập nhật' : 'Thêm bài học')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-passage-manager">
      <div className="admin-header">
        <h2>Quản lý bài học</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="passage-controls">
        <div className="filter-section">
          <label>Lọc theo chủ đề:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.slug}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section level-filter">
          <label>Lọc theo English Level:</label>
          {levelsLoading ? (
            <p>Đang tải levels...</p>
          ) : (
            <div className="level-checkboxes">
              <div className="checkbox-row">
                {englishLevelOptions.slice(0, 3).map((level) => (
                  <label key={level.id} className="level-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level.key as EnglishLevel)}
                      onChange={(e) => handleLevelFilterChange(level.key as EnglishLevel, e.target.checked)}
                    />
                    <span className="checkbox-label">{level.icon} {level.label.split(' ')[0]}</span>
                  </label>
                ))}
              </div>
              <div className="checkbox-row">
                {englishLevelOptions.slice(3).map((level) => (
                  <label key={level.id} className="level-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level.key as EnglishLevel)}
                      onChange={(e) => handleLevelFilterChange(level.key as EnglishLevel, e.target.checked)}
                    />
                    <span className="checkbox-label">{level.icon} {level.label.split(' ')[0]}</span>
                  </label>
                ))}
              </div>
              <div className="filter-actions">
                <button 
                  type="button" 
                  className="filter-btn small" 
                  onClick={selectAllLevelFilters}
                >
                  Chọn tất cả
                </button>
                <button 
                  type="button" 
                  className="filter-btn small" 
                  onClick={clearLevelFilters}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button className="add-button" onClick={handleAddPassage}>
          + Thêm bài học mới
        </button>
      </div>

      <div className="passages-list">
        {filteredPassages.length === 0 ? (
          <div className="no-passages">
            <p>Không có bài học nào</p>
          </div>
        ) : (
          filteredPassages.map(passage => (
            <div key={passage.id} className="passage-item">
              <div className="passage-info">
                <h3>{passage.title}</h3>
                <p className="passage-meta">
                  Chủ đề: {topics.find(t => t.slug === passage.topicSlug)?.name || 'Unknown'} | 
                  English Level: {getEnglishLevelDisplay(passage.englishLevel, passage.level)} |
                  Từ vựng: {passage.vocab?.length || 0} từ
                </p>
                <p className="passage-content">{passage.text.substring(0, 100)}...</p>
              </div>
              
              <div className="passage-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditPassage(passage)}
                >
                  Sửa
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePassage(passage.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPassageManager;
