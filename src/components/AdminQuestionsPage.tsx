import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { questionService } from '../firebase/questionService';
import { passageService } from '../firebase/passageService';
import { Passage } from '../types';

const AdminQuestionsPage: React.FC = () => {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, passagesData] = await Promise.all([
        questionService.getAll(),
        passageService.getAll()
      ]);
      setQuestions(questionsData);
      setPassages(passagesData);
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
      const questionData = {
        ...formData,
        options: formData.type === 'multiple_choice' ? formData.options : undefined,
        correctAnswer: formData.type === 'true_false' ? formData.correctAnswer : 
                      formData.type === 'multiple_choice' ? parseInt(formData.correctAnswer) : 
                      formData.correctAnswer
      };

      if (editingQuestion) {
        await questionService.update(editingQuestion.id, questionData);
        alert('Cập nhật câu hỏi thành công!');
      } else {
        await questionService.add(questionData);
        alert('Thêm câu hỏi thành công!');
      }

      setShowForm(false);
      setEditingQuestion(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Lỗi khi lưu câu hỏi');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      passageId: question.passageId,
      type: question.type,
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.type === 'multiple_choice' ? question.correctAnswer.toString() : 
                    question.correctAnswer.toString(),
      explanation: question.explanation || '',
      points: question.points,
      vocabFocus: question.vocabFocus || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      try {
        await questionService.delete(id);
        alert('Xóa câu hỏi thành công!');
        loadData();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Lỗi khi xóa câu hỏi');
      }
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

  // const getPassageTitle = (passageId: string) => {
  //   const passage = passages.find(p => p.id === passageId);
  //   return passage ? passage.title : 'Unknown Passage';
  // };

  const getPassagesByTopic = () => {
    return passages.reduce((acc, passage) => {
      const topicSlug = passage.topicSlug || 'unknown';
      if (!acc[topicSlug]) {
        acc[topicSlug] = [];
      }
      acc[topicSlug].push(passage);
      return acc;
    }, {} as Record<string, Passage[]>);
  };

  const getTopicName = (topicSlug: string) => {
    const topicNames: Record<string, string> = {
      'travel': '✈️ Du lịch',
      'daily-activities': '🏠 Hoạt động hàng ngày', 
      'nature': '🌿 Thiên nhiên',
      'unknown': '❓ Chưa phân loại'
    };
    return topicNames[topicSlug] || topicSlug;
  };

  const getQuestionsForPassage = (passageId: string) => {
    return questions.filter(q => q.passageId === passageId);
  };

  const handlePassageClick = (passage: Passage) => {
    setSelectedPassage(passage);
    setViewMode('passage');
  };

  const handleBackToTopics = () => {
    setSelectedPassage(null);
    setViewMode('topics');
  };




  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  const renderTopicsView = () => {
    const passagesByTopic = getPassagesByTopic();
    
    return (
      <div>

        <h3>Chủ đề và đoạn văn ({passages.length} đoạn văn, {questions.length} câu hỏi)</h3>
        
        {Object.entries(passagesByTopic).map(([topicSlug, topicPassages]) => (
          <div key={topicSlug} style={{ marginBottom: '30px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '8px 8px 0 0',
              marginBottom: '0'
            }}>
              <h4 style={{ margin: '0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                {getTopicName(topicSlug)}
              </h4>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                {topicPassages.length} đoạn văn
              </p>
            </div>
            
            <div style={{ 
              border: '1px solid #ddd', 
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ display: 'grid', gap: '10px', padding: '15px' }}>
                {topicPassages.map((passage) => {
                  const passageQuestions = getQuestionsForPassage(passage.id);
                  return (
                    <div 
                      key={passage.id}
                      onClick={() => handlePassageClick(passage)}
                      style={{ 
                        border: '1px solid #e0e0e0', 
                        padding: '15px', 
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.1rem' }}>
                            📖 {passage.title}
                          </h5>
                          <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
                            {passage.excerpt && passage.excerpt.length > 100 
                              ? `${passage.excerpt.substring(0, 100)}...` 
                              : passage.excerpt || 'Không có mô tả'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                          <div style={{
                            background: passageQuestions.length > 0 ? '#00b894' : '#ff7675',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            marginBottom: '5px'
                          }}>
                            {passageQuestions.length} câu hỏi
                          </div>
                          <div style={{ fontSize: '0.8em', color: '#666' }}>
                            👆 Click để xem
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPassageView = () => {
    if (!selectedPassage) return null;
    
    const passageQuestions = getQuestionsForPassage(selectedPassage.id);
    
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <button
            className="button"
            onClick={handleBackToTopics}
            style={{ marginRight: '10px' }}
          >
            ← Quay lại
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>
            📖 {selectedPassage.title}
          </h3>
          <p style={{ margin: '0 0 10px 0', opacity: 0.9 }}>
            {selectedPassage.excerpt}
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', opacity: 0.8 }}>
            <span>🏷️ {getTopicName(selectedPassage.topicSlug || 'unknown')}</span>
            <span>❓ {passageQuestions.length} câu hỏi</span>
          </div>
        </div>

        <h4>Câu hỏi của đoạn văn ({passageQuestions.length})</h4>
        
        {passageQuestions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>📝</p>
            <p style={{ margin: '0' }}>Chưa có câu hỏi nào cho đoạn văn này.</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
              Nhấn "Thêm câu hỏi mới" để tạo câu hỏi đầu tiên.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {passageQuestions.map((question, index) => (
              <div 
                key={question.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                        {index + 1}
                      </span>
                      <h5 style={{ margin: '0', color: '#333', fontSize: '1rem' }}>
                        {question.question}
                      </h5>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85em', color: '#666' }}>
                      <span>
                        <strong>Loại:</strong> {
                          question.type === 'multiple_choice' ? 'Trắc nghiệm' :
                          question.type === 'fill_blank' ? 'Điền từ' : 'Đúng/Sai'
                        }
                      </span>
                      <span>
                        <strong>Điểm:</strong> {question.points}
                      </span>
                      {question.vocabFocus && question.vocabFocus.length > 0 && (
                        <span>
                          <strong>Từ vựng:</strong> {question.vocabFocus.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
                    <button
                      className="button"
                      onClick={() => handleEdit(question)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      Sửa
                    </button>
                    <button
                      className="button"
                      onClick={() => handleDelete(question.id)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#dc3545' }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 20px 0' }}>Quản lý câu hỏi</h2>
      
      {viewMode === 'topics' ? renderTopicsView() : renderPassageView()}

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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Loại câu hỏi:
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  type: e.target.value as any,
                  options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : [],
                  correctAnswer: ''
                })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="multiple_choice">Trắc nghiệm</option>
                <option value="fill_blank">Điền từ</option>
                <option value="true_false">Đúng/Sai</option>
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
                placeholder="Nhập giải thích cho đáp án..."
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
                Từ vựng liên quan (cách nhau bởi dấu phẩy):
              </label>
              <input
                type="text"
                value={formData.vocabFocus.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vocabFocus: e.target.value.split(',').map(v => v.trim()).filter(v => v) 
                })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="mist, fog, light, surface..."
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
