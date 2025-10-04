import React, { useState, useEffect } from 'react';
import { PassageVocab } from '../types';
import { passageService } from '../firebase/passageService';

interface VocabWithPassage extends PassageVocab {
  id: string;
  passageId: string;
  passageTitle: string;
}

const AdminVocabPage: React.FC = () => {
  const [vocabs, setVocabs] = useState<VocabWithPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVocab, setEditingVocab] = useState<VocabWithPassage | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadVocabs();
  }, []);

  const loadVocabs = async () => {
    setLoading(true);
    try {
      const passages = await passageService.getAll();
      const allVocabs: VocabWithPassage[] = [];
      
      passages.forEach(passage => {
        if (passage.vocab && passage.vocab.length > 0) {
          passage.vocab.forEach((vocab, index) => {
            allVocabs.push({
              ...vocab,
              id: `${passage.id}-${index}`, // Unique ID combining passage ID and vocab index
              passageId: passage.id,
              passageTitle: passage.title
            });
          });
        }
      });
      
      console.log('Loaded vocabs from passages:', allVocabs);
      setVocabs(allVocabs);
    } catch (error) {
      console.error('Error loading vocabs:', error);
      alert('❌ Lỗi khi tải từ vựng');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingVocab(null);
    setShowForm(true);
  };

  const handleEdit = (vocab: VocabWithPassage) => {
    setEditingVocab(vocab);
    setShowForm(true);
  };

  const handleDelete = async (vocab: VocabWithPassage) => {
    if (window.confirm(`Bạn có chắc muốn xóa từ "${vocab.term}" khỏi đoạn văn "${vocab.passageTitle}"?`)) {
      try {
        const passages = await passageService.getAll();
        const passage = passages.find(p => p.id === vocab.passageId);
        
        if (passage && passage.vocab) {
          const updatedVocab = passage.vocab.filter(v => v.term !== vocab.term);
          await passageService.update(vocab.passageId, { vocab: updatedVocab });
          alert('✅ Đã xóa từ vựng thành công!');
          loadVocabs(); // Reload the list
        }
      } catch (error) {
        console.error('Error deleting vocab:', error);
        alert('❌ Lỗi khi xóa từ vựng');
      }
    }
  };

  const handleSave = async (vocabData: PassageVocab) => {
    try {
      if (editingVocab) {
        // Update existing vocab in passage
        const passages = await passageService.getAll();
        const passage = passages.find(p => p.id === editingVocab.passageId);
        
        if (passage && passage.vocab) {
          const updatedVocab = passage.vocab.map(v => 
            v.term === editingVocab.term ? vocabData : v
          );
          await passageService.update(editingVocab.passageId, { vocab: updatedVocab });
          alert('✅ Đã cập nhật từ vựng thành công!');
        }
      } else {
        // For adding new vocab, we need to know which passage to add it to
        // This should be handled differently - maybe redirect to passage management
        alert('⚠️ Để thêm từ vựng mới, vui lòng vào "Quản lý chủ đề" → chọn đoạn văn → "Quản lý từ vựng"');
        return;
      }
      setShowForm(false);
      setEditingVocab(null);
      loadVocabs();
    } catch (error) {
      console.error('Error saving vocab:', error);
      alert('❌ Lỗi khi lưu từ vựng');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: 'white' }}>🔄 Đang tải...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">

      <div className="sentence-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title">📚 Quản lý từ vựng</h2>
          <button className="button" onClick={handleAdd}>
            ➕ Thêm từ mới
          </button>
        </div>

        {showForm && (
          <VocabForm
            vocab={editingVocab}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingVocab(null);
            }}
          />
        )}

        <div className="vocabulary-grid">
          {vocabs.map((vocab) => (
            <div key={vocab.id} className="vocabulary-card">
              {vocab.image && (
                <img src={vocab.image} alt={vocab.term} />
              )}
              <h3>{vocab.term}</h3>
              <p><strong>Loại:</strong> {vocab.partOfSpeech || 'N/A'}</p>
              <p><strong>Nghĩa tiếng Việt:</strong> {vocab.meaning || 'N/A'}</p>
              <p><strong>Định nghĩa EN:</strong> {vocab.definitionEn ? vocab.definitionEn.substring(0, 50) + '...' : 'N/A'}</p>
              <p><strong>Đoạn văn:</strong> {vocab.passageTitle}</p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button 
                  className="button" 
                  onClick={() => handleEdit(vocab)}
                  style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  ✏️ Sửa
                </button>
                <button 
                  className="button" 
                  onClick={() => handleDelete(vocab)}
                  style={{ padding: '6px 12px', fontSize: '0.9rem', background: '#ff7675' }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {vocabs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Chưa có từ vựng nào. Hãy thêm từ đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface VocabFormProps {
  vocab: VocabWithPassage | null;
  onSave: (vocab: PassageVocab) => void;
  onCancel: () => void;
}

const VocabForm: React.FC<VocabFormProps> = ({ vocab, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PassageVocab>({
    term: vocab?.term || '',
    partOfSpeech: vocab?.partOfSpeech || '',
    definitionEn: vocab?.definitionEn || '',
    meaning: vocab?.meaning || '',
    image: vocab?.image || '',
    phonetics: {
      uk: vocab?.phonetics?.uk || '',
      us: vocab?.phonetics?.us || ''
    },
    examples: vocab?.examples || []
  });

  const [newExample, setNewExample] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.term.trim()) {
      alert('Vui lòng nhập từ vựng');
      return;
    }
    onSave(formData);
  };

  const addExample = () => {
    if (newExample.trim()) {
      setFormData(prev => ({
        ...prev,
        examples: [...(prev.examples || []), newExample.trim()]
      }));
      setNewExample('');
    }
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index) || []
    }));
  };


  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
      <h3>{vocab ? '✏️ Sửa từ vựng' : '➕ Thêm từ vựng mới'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label>Từ vựng *</label>
            <input
              type="text"
              value={formData.term}
              onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              required
            />
          </div>
          
          <div>
            <label>Từ loại</label>
            <input
              type="text"
              value={formData.partOfSpeech}
              onChange={(e) => setFormData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
              placeholder="noun [C], verb, adj..."
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Định nghĩa tiếng Anh *</label>
          <textarea
            value={formData.definitionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, definitionEn: e.target.value }))}
            style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '60px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Nghĩa tiếng Việt</label>
          <input
            type="text"
            value={formData.meaning}
            onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label>Phát âm UK</label>
            <input
              type="text"
              value={formData.phonetics?.uk || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                phonetics: { ...prev.phonetics, uk: e.target.value }
              }))}
              placeholder="/kɑː/"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Phát âm US</label>
            <input
              type="text"
              value={formData.phonetics?.us || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                phonetics: { ...prev.phonetics, us: e.target.value }
              }))}
              placeholder="/kɑr/"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>URL ảnh minh họa</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="https://..."
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Ví dụ</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              placeholder="Nhập câu ví dụ..."
              style={{ flex: 1, padding: '8px' }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
            />
            <button type="button" className="button" onClick={addExample}>Thêm</button>
          </div>
          <div style={{ marginTop: '8px' }}>
            {formData.examples?.map((example, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ flex: 1 }}>• {example}</span>
                <button type="button" onClick={() => removeExample(index)} style={{ color: 'red' }}>✕</button>
              </div>
            ))}
          </div>
        </div>


        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="button" onClick={onCancel} style={{ background: '#636e72' }}>
            Hủy
          </button>
          <button type="submit" className="button">
            {vocab ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminVocabPage;
