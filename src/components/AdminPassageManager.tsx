import React, { useState, useEffect } from 'react';
import { Passage, Topic } from '../types';
import { passageService } from '../firebase/passageService';
import { topicService } from '../firebase/topicService';

interface AdminPassageManagerProps {
  onClose: () => void;
}

const AdminPassageManager: React.FC<AdminPassageManagerProps> = ({ onClose }) => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassage, setEditingPassage] = useState<Passage | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    topicId: '',
    topicSlug: '',
    level: 1,
    audioUrl: '',
    thumbnail: '',
    youtubeUrl: '',
    vocab: [] as any[]
  });

  useEffect(() => {
    loadData();
  }, []);

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

  const filteredPassages = selectedTopic 
    ? passages.filter(p => p.topicSlug === selectedTopic)
    : passages;

  const handleAddPassage = () => {
    setFormData({
      title: '',
      text: '',
      topicId: '',
      topicSlug: selectedTopic || '',
      level: 1,
      audioUrl: '',
      thumbnail: '',
      youtubeUrl: '',
      vocab: []
    });
    setEditingPassage(null);
    setShowAddForm(true);
  };

  const handleEditPassage = (passage: Passage) => {
    setFormData({
      title: passage.title,
      text: passage.text,
      topicId: passage.topicId,
      topicSlug: passage.topicSlug || '',
      level: passage.level,
      audioUrl: passage.audioUrl || '',
      thumbnail: passage.thumbnail || '',
      youtubeUrl: '',
      vocab: passage.vocab || []
    });
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

  // Function to process vocabulary from text and save to passage.vocab
  const processVocabularyFromText = async (passageId: string, text: string) => {
    try {
      console.log('📚 Auto-processing vocabulary from text...');
      
      const detectedWords = extractVocabularyFromText(text);
      console.log('📚 Detected words from text:', detectedWords);
      
      if (detectedWords.length === 0) {
        console.log('📚 No vocabulary detected in text');
        return;
      }
      
      // Prepare vocabulary data
      const vocabData = detectedWords.map(word => ({
        term: word,
        meaning: `Nghĩa của ${word}`,
        definitionEn: `Definition of ${word}`
      }));
      
      // Update passage with vocabulary
      await passageService.update(passageId, { vocab: vocabData });
      
      console.log('✅ Vocabulary processed and saved:', vocabData);
      
    } catch (error) {
      console.error('❌ Error processing vocabulary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPassage) {
        // Update existing passage
        await passageService.update(editingPassage.id, formData);
        // Auto-process vocabulary from text
        await processVocabularyFromText(editingPassage.id, formData.text);
        
        setPassages(passages.map(p => 
          p.id === editingPassage.id ? { ...p, ...formData } : p
        ));
        alert('Đã cập nhật bài học thành công!');
      } else {
        // Add new passage
        const newPassage = await passageService.add(formData);
        if (newPassage) {
          // Auto-process vocabulary from text
          await processVocabularyFromText(newPassage, formData.text);
          
          setPassages([...passages, { ...formData, id: newPassage }]);
          alert('Đã thêm bài học thành công!');
        }
      }
      setShowAddForm(false);
      setEditingPassage(null);
    } catch (error) {
      console.error('Error saving passage:', error);
      alert('Lỗi khi lưu bài học');
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
              required
            />
          </div>

          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              required
            />
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
            <label>Trình độ:</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            >
              <option value={1}>A1</option>
              <option value={2}>A2</option>
              <option value={3}>B1</option>
              <option value={4}>B2</option>
            </select>
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
            <button type="submit" className="submit-btn">
              {editingPassage ? 'Cập nhật' : 'Thêm bài học'}
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
                  Trình độ: {['A1', 'A2', 'B1', 'B2'][passage.level - 1]} |
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
