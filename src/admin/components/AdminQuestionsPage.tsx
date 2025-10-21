import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, Passage } from '../../types';
import { questionService } from '../../firebase/questionService';
import { passageService } from '../../firebase/passageService';

const AdminQuestionsPage: React.FC = () => {
  const { passageId } = useParams<{ passageId?: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [viewMode, setViewMode] = useState<'topics' | 'passage'>('topics');
  const [formData, setFormData] = useState({
    passageId: '',
    type: 'multiple_choice' as 'multiple_choice' | 'fill_blank' | 'true_false',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 5,
    vocabFocus: [] as string[]
  });

  // Add missing state and functions for topic creation
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    slug: '',
    thumbnail: null as File | null
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string>('');

  useEffect(() => {
    // Always load passages first
    const loadPassages = async () => {
      try {
        setLoading(true);
        const passagesData = await passageService.getAll();
        setPassages(passagesData);
        console.log('📚 Passages loaded:', passagesData.length);
      } catch (error) {
        console.error('Error loading passages:', error);
        alert('Lỗi khi tải danh sách đoạn văn');
      } finally {
        setLoading(false);
      }
    };
    
    loadPassages();
  }, []);

  // Load all questions when not in specific passage view
  useEffect(() => {
    if (!passageId) {
      const loadAllQuestions = async () => {
        try {
          setLoading(true);
          const questionsData = await questionService.getAll();
          setQuestions(questionsData);
          console.log('📝 All questions loaded:', questionsData.length);
        } catch (error) {
          console.error('Error loading questions:', error);
          alert('Lỗi khi tải câu hỏi');
        } finally {
          setLoading(false);
        }
      };
      loadAllQuestions();
    }
  }, [passageId]);

  // Auto-select passage if passageId is provided in URL
  useEffect(() => {
    console.log('🔍 URL passageId:', passageId);
    console.log('🔍 Available passages:', passages.length);
    if (passageId && passages.length > 0) {
      const passage = passages.find(p => p.id === passageId);
      console.log('🔍 Found passage:', passage);
      if (passage) {
        setSelectedPassage(passage);
        setViewMode('passage');
        setFormData(prev => ({ ...prev, passageId: passage.id }));
        // Load questions for this specific passage
        loadQuestionsForPassage(passage.id);
      } else {
        console.log('❌ Passage not found for ID:', passageId);
        console.log('Available passage IDs:', passages.map(p => p.id));
      }
    }
  }, [passageId, passages]);

  // Load questions for a specific passage
  const loadQuestionsForPassage = async (passageId: string) => {
    try {
      console.log('🔍 Loading questions for passage:', passageId);
      setLoading(true);
      const passageQuestions = await questionService.getByPassageId(passageId);
      console.log('📝 Questions loaded:', passageQuestions);
      setQuestions(passageQuestions);
    } catch (error) {
      console.error('Error loading questions for passage:', error);
      alert('Lỗi khi tải câu hỏi cho đoạn văn');
    } finally {
      setLoading(false);
    }
  };

  // Update activeTopic when passages change
  useEffect(() => {
    if (passages.length > 0 && !activeTopic) {
      const passagesByTopic = getPassagesByTopic();
      const topicSlugs = Object.keys(passagesByTopic);
      if (topicSlugs.length > 0) {
        setActiveTopic(topicSlugs[0]);
      }
    }
  }, [passages, activeTopic]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionData = {
        ...formData,
        id: editingQuestion ? editingQuestion.id : `q_${Date.now()}`,
        correctAnswer: formData.type === 'multiple_choice' 
          ? parseInt(formData.correctAnswer) 
          : formData.type === 'true_false' 
            ? formData.correctAnswer === 'true'
            : formData.correctAnswer
      };

      if (editingQuestion) {
        await questionService.update(questionData.id, questionData);
      } else {
        await questionService.add(questionData);
      }

      // Reload questions for current passage if we're in passage view
      if (selectedPassage) {
        await loadQuestionsForPassage(selectedPassage.id);
      } else {
        // Reload all questions
        const questionsData = await questionService.getAll();
        setQuestions(questionsData);
      }
      resetForm();
      setShowForm(false);
      setEditingQuestion(null);
      alert(editingQuestion ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi mới');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Lỗi khi lưu câu hỏi');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionService.delete(questionId);
      // Reload questions for current passage
      if (selectedPassage) {
        await loadQuestionsForPassage(selectedPassage.id);
      } else {
        // Reload all questions
        const questionsData = await questionService.getAll();
        setQuestions(questionsData);
      }
      alert('Đã xóa câu hỏi');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Lỗi khi xóa câu hỏi');
    }
  };

  const createSampleQuestions = async () => {
    if (!selectedPassage) return;
    
    const sampleQuestions = [
      {
        passageId: selectedPassage.id,
        type: 'multiple_choice' as const,
        question: 'What is the main theme of this passage?',
        options: ['Nature and peace', 'City life', 'Technology', 'Sports'],
        correctAnswer: 0,
        explanation: 'The passage focuses on the peaceful and natural setting by the lake.',
        points: 5,
        vocabFocus: ['theme', 'passage', 'nature', 'peace']
      },
      {
        passageId: selectedPassage.id,
        type: 'fill_blank' as const,
        question: 'The morning by the lake is described as ______ and peaceful.',
        correctAnswer: 'calm',
        explanation: 'The passage emphasizes the calm and peaceful nature of the morning.',
        points: 3,
        vocabFocus: ['morning', 'lake', 'calm', 'peaceful']
      },
      {
        passageId: selectedPassage.id,
        type: 'true_false' as const,
        question: 'The passage describes a busy city morning.',
        correctAnswer: false,
        explanation: 'The passage describes a calm morning by the lake, not a busy city.',
        points: 2,
        vocabFocus: ['busy', 'city', 'morning']
      }
    ];

    try {
      setLoading(true);
      for (const question of sampleQuestions) {
        await questionService.add(question);
      }
      
      // Reload questions
      await loadQuestionsForPassage(selectedPassage.id);
      alert('Đã tạo 3 câu hỏi mẫu thành công!');
    } catch (error) {
      console.error('Error creating sample questions:', error);
      alert('Lỗi khi tạo câu hỏi mẫu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      passageId: '',
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 5,
      vocabFocus: []
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTopicFormData({ ...topicFormData, thumbnail: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create topic logic here
      alert('Chức năng tạo chủ đề sẽ được triển khai');
      resetTopicForm();
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Lỗi khi tạo chủ đề');
    }
  };

  const resetTopicForm = () => {
    setTopicFormData({ title: '', slug: '', thumbnail: null });
    setSelectedImage(null);
    setShowTopicForm(false);
  };

  const getTopicName = (topicSlug: string) => {
    const hardcodedTopics: Record<string, string> = {
      'nature': '🌿 Thiên nhiên',
      'travel': '✈️ Du lịch', 
      'daily': '🏠 Cuộc sống hàng ngày',
      'food': '🍽️ Ẩm thực',
      'technology': '💻 Công nghệ',
      'health': '🏥 Sức khỏe',
      'education': '📚 Giáo dục',
      'sports': '⚽ Thể thao',
      'music': '🎵 Âm nhạc',
      'art': '🎨 Nghệ thuật'
    };
    
    return hardcodedTopics[topicSlug] || topicSlug;
  };

  const getPassagesByTopic = () => {
    const result: Record<string, Passage[]> = {};
    
    passages.forEach(passage => {
      const topicSlug = passage.topicSlug || 'unknown';
      if (!result[topicSlug]) {
        result[topicSlug] = [];
      }
      result[topicSlug].push(passage);
    });
    
    return result;
  };

  const renderTopicForm = () => {
    return (
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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Tạo chủ đề mới</h3>
          
          <form onSubmit={handleCreateTopic}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tên chủ đề:
              </label>
              <input
                type="text"
                value={topicFormData.title}
                onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Slug (URL-friendly):
              </label>
              <input
                type="text"
                value={topicFormData.slug}
                onChange={(e) => setTopicFormData({ ...topicFormData, slug: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Thumbnail (ảnh đại diện):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              {selectedImage && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={resetTopicForm}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Tạo chủ đề
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  const renderTopicsView = () => {
    const passagesByTopic = getPassagesByTopic();
    const topicSlugs = Object.keys(passagesByTopic);
    
    return (
      <div>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e0e0e0',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {topicSlugs.map((topicSlug) => (
            <button
              key={topicSlug}
              onClick={() => setActiveTopic(topicSlug)}
              style={{
                padding: '12px 20px',
                border: 'none',
                backgroundColor: activeTopic === topicSlug ? '#007bff' : '#f8f9fa',
                color: activeTopic === topicSlug ? 'white' : '#333',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTopic === topicSlug ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                borderBottom: activeTopic === topicSlug ? '2px solid #007bff' : '2px solid transparent'
              }}
            >
              {getTopicName(topicSlug)}
            </button>
          ))}
          
          {/* Add New Topic Button */}
          <button
            onClick={() => setShowTopicForm(true)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              marginLeft: 'auto'
            }}
          >
            ➕ Tạo chủ đề mới
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTopic && passagesByTopic[activeTopic] && (
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '0 8px 8px 8px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              {getTopicName(activeTopic)} ({passagesByTopic[activeTopic].length} đoạn văn)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {passagesByTopic[activeTopic].map((passage) => {
                const passageQuestions = questions.filter(q => q.passageId === passage.id);
                const vocabCount = passage.text.match(/\[([^\]]+)\]/g)?.length || 0;
                
                return (
                  <div key={passage.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{passage.title}</h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                      📝 {passage.text.substring(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#888' }}>
                      <span>❓ {passageQuestions.length} câu hỏi</span>
                      <span>📚 {vocabCount} từ vựng</span>
                    </div>
                    <button
                      onClick={() => setSelectedPassage(passage)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Quản lý câu hỏi
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {activeTopic && (!passagesByTopic[activeTopic] || passagesByTopic[activeTopic].length === 0) && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: '0 8px 8px 8px',
            backgroundColor: '#fafafa'
          }}>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Chưa có đoạn văn nào trong chủ đề "{getTopicName(activeTopic)}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {showTopicForm && renderTopicForm()}
      
      {viewMode === 'topics' ? renderTopicsView() : (
        <div>
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
            <h2 style={{ margin: 0 }}>Quản lý câu hỏi cho: {selectedPassage?.title}</h2>
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
            <strong>Debug Info:</strong> Passage ID: {selectedPassage?.id} | Questions Count: {questions.length} | Loading: {loading ? 'Yes' : 'No'}
            <br />
            <strong>All Questions in DB:</strong> {questions.map(q => q.id).join(', ')}
          </div>
          
          {/* Questions List */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Danh sách câu hỏi ({questions.length})</h3>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Passage ID: {selectedPassage?.id}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Thêm câu hỏi mới
                </button>
                <button 
                  onClick={createSampleQuestions}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  🎯 Tạo câu hỏi mẫu
                </button>
              </div>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Đang tải câu hỏi...</div>
              </div>
            ) : questions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
                  📝 Chưa có câu hỏi nào cho đoạn văn này
                </p>
                <p style={{ margin: '10px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                  Nhấn "Thêm câu hỏi mới" để bắt đầu tạo câu hỏi
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {questions.map((question, index) => (
                  <div key={question.id} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
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
                          Câu #{index + 1} • {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 
                                           question.type === 'fill_blank' ? 'Điền từ' : 'Đúng/Sai'}
                        </div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{question.question}</h4>
                        
                        {question.type === 'multiple_choice' && question.options && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong>Lựa chọn:</strong>
                            <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} style={{ 
                                  color: optIndex === question.correctAnswer ? '#28a745' : '#333',
                                  fontWeight: optIndex === question.correctAnswer ? 'bold' : 'normal'
                                }}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {optIndex === question.correctAnswer && ' ✓'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#6c757d' }}>
                          <span>📊 {question.points} điểm</span>
                          <span>🎯 Đáp án: {typeof question.correctAnswer === 'boolean' ? 
                            (question.correctAnswer ? 'Đúng' : 'Sai') : 
                            question.correctAnswer}</span>
                        </div>
                        
                        {question.explanation && (
                          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                            <strong>Giải thích:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                        <button
                          onClick={() => {
                            setEditingQuestion(question);
                            setFormData({
                              passageId: question.passageId,
                              type: question.type,
                              question: question.question,
                              options: question.options || ['', '', '', ''],
                              correctAnswer: String(question.correctAnswer),
                              explanation: question.explanation || '',
                              points: question.points,
                              vocabFocus: question.vocabFocus || []
                            });
                            setShowForm(true);
                          }}
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
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                              handleDeleteQuestion(question.id);
                            }
                          }}
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
        </div>
      )}

      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
          
          <form onSubmit={handleSubmit}>
            {!selectedPassage && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Đoạn văn:
              </label>
              <select
                value={formData.passageId}
                onChange={(e) => setFormData({ ...formData, passageId: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Chọn đoạn văn</option>
                {passages.map(passage => (
                  <option key={passage.id} value={passage.id}>
                    {passage.title}
                  </option>
                ))}
              </select>
            </div>
            )}
            
            {selectedPassage && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Đoạn văn:
                </label>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '4px', 
                  border: '1px solid #ced4da',
                  color: '#495057'
                }}>
                  📝 {selectedPassage.title}
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Loại câu hỏi:
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="multiple_choice">Trắc nghiệm</option>
                <option value="true_false">Đúng/Sai</option>
                <option value="fill_blank">Điền từ</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Câu hỏi:
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Nhập câu hỏi..."
              />
            </div>
            
            {formData.type === 'multiple_choice' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Các lựa chọn:
                </label>
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Lựa chọn ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginBottom: '5px',
                      borderRadius: '4px', 
                      border: '1px solid #ccc' 
                    }}
                  />
                ))}
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Đáp án đúng:
                {formData.type === 'multiple_choice' && ' (0, 1, 2, 3)'}
                {formData.type === 'true_false' && ' (true/false)'}
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder={
                  formData.type === 'multiple_choice' ? 'Nhập số (0, 1, 2, 3)' :
                  formData.type === 'true_false' ? 'Nhập true hoặc false' :
                  'Nhập đáp án'
                }
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giải thích:
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                required
                rows={2}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Giải thích tại sao đáp án này đúng..."
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Điểm số:
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 5 })}
                min="1"
                max="20"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Từ vựng liên quan (phân cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                value={formData.vocabFocus.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  vocabFocus: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="peaceful, calm, serene"
              />
            </div>
            
            <div>
              <button type="submit" className="button" style={{ marginRight: '10px' }}>
                {editingQuestion ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingQuestion(null);
                  resetForm();
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsPage;