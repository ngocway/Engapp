import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vocabulary } from '../types';
import { vocabularyService } from '../firebase/vocabularyService';
import { passageService } from '../firebase/passageService';
import { Passage } from '../types';
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { PronunciationService } from '../services/pronunciationService';

const AdminVocabularyPage: React.FC = () => {
  const { passageId } = useParams<{ passageId: string }>();
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    pronunciation: '',
    vietnamesePronunciation: '', // Phiên âm đọc cho người Việt
    audioUrl: '',
    imageUrl: '',
    example: '', // for backward compatibility
    examples: [''] // new field for multiple examples
  });
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Audio upload states
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isAudioDragOver, setIsAudioDragOver] = useState(false);
  
  // AI suggestion states
  const [isGeneratingPronunciation, setIsGeneratingPronunciation] = useState(false);

  useEffect(() => {
    loadData();
  }, [passageId]);

  // Examples management functions
  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => i === index ? value : example)
    }));
  };

  // AI pronunciation generation
  const generateVietnamesePronunciation = async () => {
    if (!formData.word.trim()) {
      alert('Vui lòng nhập từ vựng trước');
      return;
    }

    setIsGeneratingPronunciation(true);
    try {
      const pronunciation = await PronunciationService.generateVietnamesePronunciation(
        formData.word, 
        formData.meaning
      );
      
      setFormData(prev => ({
        ...prev,
        vietnamesePronunciation: pronunciation
      }));
      
      // Show success message
      console.log(`✅ AI đã gợi ý phiên âm: "${pronunciation}" cho từ "${formData.word}"`);
    } catch (error) {
      console.error('Error generating pronunciation:', error);
      alert('Lỗi khi tạo phiên âm. Vui lòng thử lại.');
    } finally {
      setIsGeneratingPronunciation(false);
    }
  };

  // Image upload functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL when file is selected
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL when file is selected
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setUploadingImage(true);
    setImageUploadProgress(0);

    const storageRef = ref(storage, `vocabulary/images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          setUploadingImage(false);
          reject(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadingImage(false);
          setImageUploadProgress(0);
          resolve(downloadURL);
        }
      );
    });
  };

  // Audio upload functions
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, audioUrl: '' })); // Clear URL when file is selected
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
  };

  const handleAudioDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDragOver(true);
  };

  const handleAudioDragLeave = () => {
    setIsAudioDragOver(false);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, audioUrl: '' })); // Clear URL when file is selected
    }
  };

  const handleAudioUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setUploadingAudio(true);
    setAudioUploadProgress(0);

    const storageRef = ref(storage, `vocabulary/audio/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setAudioUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading audio:', error);
          setUploadingAudio(false);
          reject(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadingAudio(false);
          setAudioUploadProgress(0);
          resolve(downloadURL);
        }
      );
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [passageData, allVocabData] = await Promise.all([
        passageService.getAll().then(passages => passages.find(p => p.id === passageId)),
        vocabularyService.getAllVocabulary()
      ]);
      
      setPassage(passageData || null);
      
      // Load vocabularies from passage.vocab array if it exists
      let passageVocabularies: Vocabulary[] = [];
      if (passageData?.vocab && Array.isArray(passageData.vocab)) {
        // Convert passage vocab format to Vocabulary format
        passageVocabularies = passageData.vocab.map((vocabItem: any, index: number) => {
          // Handle examples - prioritize examples array, fallback to single example
          let examples: string[] = [];
          if (vocabItem.examples && Array.isArray(vocabItem.examples)) {
            examples = vocabItem.examples.filter((ex: string) => ex && ex.trim());
          } else if (vocabItem.example) {
            examples = [vocabItem.example];
          }
          
          // Ensure at least one empty example if none exist
          if (examples.length === 0) {
            examples = [''];
          }

          return {
            id: `passage_${passageData.id}_${index}`, // Generate ID
            word: vocabItem.term || vocabItem.word || '',
            meaning: vocabItem.meaning || '',
            pronunciation: vocabItem.pronunciation || vocabItem.phonetics?.us || vocabItem.us || '',
            vietnamesePronunciation: vocabItem.vietnamesePronunciation || '',
            audioUrl: vocabItem.audio || vocabItem.audioUrl || '',
            imageUrl: vocabItem.image || vocabItem.imageUrl || '',
            example: vocabItem.example || (examples.length > 0 ? examples[0] : ''), // for backward compatibility
            examples: examples,
            learned: false
          };
        });
      }
      
      // Also include all vocabularies from the general vocabulary collection
      // This allows admin to see both passage-specific and general vocabularies
      const allVocabularies = [...passageVocabularies, ...allVocabData];
      setVocabularies(allVocabularies);
      
      console.log('📚 Loaded vocabularies:', {
        passageId: passageData?.id,
        passageTitle: passageData?.title,
        passageVocabCount: passageVocabularies.length,
        generalVocabCount: allVocabData.length,
        totalCount: allVocabularies.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.imageUrl;
      let finalAudioUrl = formData.audioUrl;

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadedImageUrl = await handleImageUpload(imageFile);
        if (!uploadedImageUrl) {
          alert('Lỗi khi tải lên ảnh');
          return;
        }
        finalImageUrl = uploadedImageUrl;
      }

      // Upload audio if a new file is selected
      if (audioFile) {
        const uploadedAudioUrl = await handleAudioUpload(audioFile);
        if (!uploadedAudioUrl) {
          alert('Lỗi khi tải lên audio');
          return;
        }
        finalAudioUrl = uploadedAudioUrl;
      }

      // Filter out empty examples
      const filteredExamples = formData.examples.filter(example => example && example.trim());
      
      const vocabData = {
        ...formData,
        imageUrl: finalImageUrl,
        audioUrl: finalAudioUrl,
        examples: filteredExamples.length > 0 ? filteredExamples : undefined,
        example: filteredExamples.length > 0 ? filteredExamples[0] : '' // for backward compatibility
      };

      if (editingVocab) {
        await vocabularyService.updateVocabulary(editingVocab.id, vocabData);
        alert('Đã cập nhật từ vựng');
      } else {
        await vocabularyService.addVocabulary(vocabData);
        alert('Đã thêm từ vựng mới');
      }

      loadData();
      resetForm();
      setShowForm(false);
      setEditingVocab(null);
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      alert('Lỗi khi lưu từ vựng');
    }
  };

  const handleDeleteVocab = async (vocabId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) {
      try {
        await vocabularyService.deleteVocabulary(vocabId);
        loadData();
        alert('Đã xóa từ vựng');
      } catch (error) {
        console.error('Error deleting vocabulary:', error);
        alert('Lỗi khi xóa từ vựng');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      word: '',
      meaning: '',
      pronunciation: '',
      vietnamesePronunciation: '',
      audioUrl: '',
      imageUrl: '',
      example: '',
      examples: ['']
    });
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsDragOver(false);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setIsAudioDragOver(false);
  };

  const handleEdit = (vocab: Vocabulary) => {
    setEditingVocab(vocab);
    
    // Handle examples - prioritize examples array, fallback to single example
    let examples: string[] = [];
    if (vocab.examples && Array.isArray(vocab.examples)) {
      examples = vocab.examples.filter(ex => ex && ex.trim());
    } else if (vocab.example) {
      examples = [vocab.example];
    }
    
    // Ensure at least one empty example if none exist
    if (examples.length === 0) {
      examples = [''];
    }
    
    setFormData({
      word: vocab.word,
      meaning: vocab.meaning,
      pronunciation: vocab.pronunciation || '',
      vietnamesePronunciation: vocab.vietnamesePronunciation || '',
      audioUrl: vocab.audioUrl || '',
      imageUrl: vocab.imageUrl || vocab.image || '',
      example: vocab.example || '',
      examples: examples
    });
    setImagePreviewUrl(vocab.imageUrl || vocab.image || null);
    setImageFile(null); // Reset file when editing
    setIsDragOver(false);
    setAudioPreviewUrl(vocab.audioUrl || null);
    setAudioFile(null); // Reset file when editing
    setIsAudioDragOver(false);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/admin')}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Quay về Admin Panel
        </button>
        <h2 style={{ margin: 0 }}>
          Quản lý từ vựng cho: {passage?.title || 'Unknown Passage'}
        </h2>
      </div>

      {/* Debug Info */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '15px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong> Passage ID: {passageId} | Vocabularies Count: {vocabularies.length}
      </div>

      {/* Vocabulary List */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Danh sách từ vựng ({vocabularies.length})</h3>
          <button 
            onClick={() => {
              resetForm();
              setEditingVocab(null);
              setShowForm(true);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ➕ Thêm từ vựng mới
          </button>
        </div>

        {vocabularies.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
              📚 Chưa có từ vựng nào
            </p>
            <p style={{ margin: '10px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Nhấn "Thêm từ vựng mới" để bắt đầu
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {vocabularies.map((vocab, index) => (
              <div key={vocab.id} className="vocabulary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'inline-block',
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}>
                      Từ #{index + 1}
                    </div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.2rem' }}>
                      {vocab.word}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      <strong>Nghĩa:</strong> {vocab.meaning}
                    </p>
                    
                    {vocab.pronunciation && (
                      <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                        <strong>Phiên âm:</strong> {vocab.pronunciation}
                      </p>
                    )}
                    
                    {vocab.vietnamesePronunciation && (
                      <p style={{ margin: '0 0 10px 0', color: '#28a745', fontStyle: 'italic' }}>
                        <strong>Đọc:</strong> {vocab.vietnamesePronunciation}
                      </p>
                    )}
                    
                    {(vocab.examples && vocab.examples.length > 0 && vocab.examples[0]) || vocab.example ? (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Ví dụ:</strong>
                        {(vocab.examples && vocab.examples.length > 0) ? (
                          <div style={{ marginTop: '5px' }}>
                            {vocab.examples.filter(ex => ex && ex.trim()).map((example, index) => (
                              <div key={index} style={{ 
                                padding: '8px', 
                                backgroundColor: '#e9ecef', 
                                borderRadius: '4px',
                                marginBottom: index < vocab.examples!.filter(ex => ex && ex.trim()).length - 1 ? '5px' : '0',
                                fontSize: '0.9rem'
                              }}>
                                {index + 1}. {example}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ 
                            padding: '8px', 
                            backgroundColor: '#e9ecef', 
                            borderRadius: '4px',
                            marginTop: '5px',
                            fontSize: '0.9rem'
                          }}>
                            {vocab.example}
                          </div>
                        )}
                      </div>
                    ) : null}
                    
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                    <button
                      onClick={() => handleEdit(vocab)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteVocab(vocab.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingVocab ? 'Sửa từ vựng' : 'Thêm từ vựng mới'}</h3>
              <button 
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Từ vựng: *
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Nhập từ vựng tiếng Anh"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nghĩa: *
                </label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Nhập nghĩa tiếng Việt"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Phiên âm:
                </label>
                <input
                  type="text"
                  value={formData.pronunciation}
                  onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="/ˈwɜːrd/"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Phiên âm đọc cho người Việt:
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    value={formData.vietnamesePronunciation}
                    onChange={(e) => setFormData({ ...formData, vietnamesePronunciation: e.target.value })}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc' 
                    }}
                    placeholder='ví dụ: "mít" hoặc "mít-xờ"'
                    disabled={isGeneratingPronunciation}
                  />
                  <button
                    type="button"
                    onClick={generateVietnamesePronunciation}
                    disabled={isGeneratingPronunciation || !formData.word.trim()}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isGeneratingPronunciation || !formData.word.trim() ? '#ccc' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isGeneratingPronunciation || !formData.word.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      minWidth: '80px',
                      justifyContent: 'center'
                    }}
                    title={!formData.word.trim() ? 'Vui lòng nhập từ vựng trước' : 'AI gợi ý phiên âm tiếng Việt'}
                  >
                    {isGeneratingPronunciation ? (
                      <>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>AI...</span>
                      </>
                    ) : (
                      <>
                        🤖 AI
                      </>
                    )}
                  </button>
                </div>
                <div style={{ 
                  marginTop: '5px', 
                  fontSize: '0.8rem', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  💡 Mẹo: Viết cách đọc theo âm tiếng Việt để dễ nhớ hơn, hoặc dùng AI để gợi ý
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Câu ví dụ:
                </label>
                
                {formData.examples.map((example, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginBottom: '10px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => updateExample(index, e.target.value)}
                        placeholder={`Ví dụ ${index + 1}: Nhập câu ví dụ...`}
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '1px solid #ccc',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      disabled={formData.examples.length === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: formData.examples.length === 1 ? '#f5f5f5' : '#dc3545',
                        color: formData.examples.length === 1 ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: formData.examples.length === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '40px'
                      }}
                      title={formData.examples.length === 1 ? 'Cần ít nhất 1 ví dụ' : 'Xóa ví dụ này'}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addExample}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  ➕ Thêm ví dụ
                </button>
                
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.8rem', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  💡 Mẹo: Thêm nhiều ví dụ giúp học viên hiểu rõ hơn cách sử dụng từ vựng
                </div>
              </div>


              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Ảnh Thumbnail:
                </label>
                
                {imagePreviewUrl && (
                  <div className="vocabulary-image-preview">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Preview" 
                    />
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="vocabulary-remove-image"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div
                  className={`vocabulary-upload-area ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadingImage ? (
                    <div className="vocabulary-upload-loading">
                      <div className="vocabulary-spinner"></div>
                      <p style={{ margin: 0, color: '#666' }}>
                        Đang tải lên... {Math.round(imageUploadProgress)}%
                      </p>
                    </div>
                  ) : (
                    <label className="vocabulary-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="vocabulary-file-input"
                      />
                      <div className="vocabulary-upload-content">
                        <span className="vocabulary-upload-icon">⬆️</span>
                        <p style={{ margin: 0, color: '#666', fontWeight: '500' }}>
                          Kéo thả ảnh vào đây hoặc <strong>click để chọn</strong>
                        </p>
                        <small style={{ color: '#999', fontSize: '0.9rem' }}>
                          Hỗ trợ: JPG, PNG, GIF
                        </small>
                      </div>
                    </label>
                  )}
                </div>

                {!imageFile && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Hoặc nhập URL ảnh:
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        border: '1px solid #ccc',
                        background: imageFile ? '#f5f5f5' : 'white',
                        color: imageFile ? '#999' : 'inherit',
                        cursor: imageFile ? 'not-allowed' : 'text'
                      }}
                      placeholder="https://example.com/image.jpg"
                      disabled={!!imageFile}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Audio Phát âm:
                </label>
                
                {audioPreviewUrl && (
                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <audio 
                      controls 
                      style={{ width: '100%', maxWidth: '400px' }}
                      src={audioPreviewUrl}
                    >
                      Trình duyệt của bạn không hỗ trợ audio.
                    </audio>
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        type="button" 
                        onClick={handleRemoveAudio}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️ Xóa audio
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`vocabulary-upload-area ${isAudioDragOver ? 'dragover' : ''}`}
                  onDragOver={handleAudioDragOver}
                  onDragLeave={handleAudioDragLeave}
                  onDrop={handleAudioDrop}
                >
                  {uploadingAudio ? (
                    <div className="vocabulary-upload-loading">
                      <div className="vocabulary-spinner"></div>
                      <p style={{ margin: 0, color: '#666' }}>
                        Đang tải lên audio... {Math.round(audioUploadProgress)}%
                      </p>
                    </div>
                  ) : (
                    <label className="vocabulary-upload-label">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileChange}
                        className="vocabulary-file-input"
                      />
                      <div className="vocabulary-upload-content">
                        <span className="vocabulary-upload-icon">🎵</span>
                        <p style={{ margin: 0, color: '#666', fontWeight: '500' }}>
                          Kéo thả audio vào đây hoặc <strong>click để chọn</strong>
                        </p>
                        <small style={{ color: '#999', fontSize: '0.9rem' }}>
                          Hỗ trợ: MP3, WAV, M4A, OGG
                        </small>
                      </div>
                    </label>
                  )}
                </div>

                {!audioFile && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Hoặc nhập URL audio:
                    </label>
                    <input
                      type="url"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        border: '1px solid #ccc',
                        background: audioFile ? '#f5f5f5' : 'white',
                        color: audioFile ? '#999' : 'inherit',
                        cursor: audioFile ? 'not-allowed' : 'text'
                      }}
                      placeholder="https://example.com/audio.mp3"
                      disabled={!!audioFile}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  disabled={uploadingImage || uploadingAudio}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: (uploadingImage || uploadingAudio) ? '#ccc' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: (uploadingImage || uploadingAudio) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={uploadingImage || uploadingAudio || !formData.word || !formData.meaning}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: (uploadingImage || uploadingAudio || !formData.word || !formData.meaning) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: (uploadingImage || uploadingAudio || !formData.word || !formData.meaning) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingImage ? 'Đang tải ảnh...' : uploadingAudio ? 'Đang tải audio...' : (editingVocab ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVocabularyPage;
