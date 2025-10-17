import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { progressService } from '../firebase/progressService';
import { useAuth } from '../contexts/AuthContext';

interface QuizSectionProps {
  questions: Question[];
  passageId: string;
}

const QuizSection: React.FC<QuizSectionProps> = ({ questions, passageId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();

  const currentQuestion = questions[currentQuestionIndex];

  // Debug effect để theo dõi khi currentQuestionIndex thay đổi
  useEffect(() => {
    console.log(`🔄 Question index changed to: ${currentQuestionIndex}`);
    console.log(`📋 Current question:`, currentQuestion);
    console.log(`💾 Current userAnswers:`, userAnswers);
  }, [currentQuestionIndex, currentQuestion, userAnswers]);

  const handleAnswer = (answer: any) => {
    // Sử dụng currentQuestionIndex làm key nếu ID rỗng
    const questionKey = currentQuestion.id || `question_${currentQuestionIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [questionKey]: answer
    }));
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      console.log(`➡️ Moving to question ${currentQuestionIndex + 2}`);
    } else {
      // Luôn hiển thị kết quả khi đến câu cuối
      calculateScore();
      setShowResults(true);
      
      // Kiểm tra xem user đã trả lời hết tất cả câu hỏi chưa
      const allQuestionsAnswered = questions.every((question, index) => {
        const questionKey = question.id || `question_${index}`;
        return userAnswers[questionKey] !== undefined && userAnswers[questionKey] !== '';
      });
      
      if (allQuestionsAnswered && user) {
        // Đánh dấu passage đã hoàn thành
        try {
          await progressService.addCompletedPassage(user.uid, passageId);
          console.log('✅ Passage marked as completed:', passageId);
        } catch (error) {
          console.error('❌ Error marking passage as completed:', error);
        }
      } else {
        console.log('❌ Not all questions answered. Questions answered:', Object.keys(userAnswers).length, 'Total questions:', questions.length);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      console.log(`⬅️ Moving to question ${currentQuestionIndex}`);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const questionKey = question.id || `question_${index}`;
      const userAnswer = userAnswers[questionKey];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>
          📝 Chưa có câu hỏi nào cho đoạn văn này
        </p>
        <p style={{ color: '#999', fontSize: '1rem' }}>
          Vui lòng liên hệ admin để thêm câu hỏi
        </p>
      </div>
    );
  }

  const handleCompletePassage = async () => {
    if (user) {
      try {
        await progressService.addCompletedPassage(user.uid, passageId);
        console.log('✅ Passage manually marked as completed:', passageId);
        alert('🎉 Đã đánh dấu đoạn văn hoàn thành! Bạn có thể xem lại trong mục Ôn tập.');
      } catch (error) {
        console.error('❌ Error marking passage as completed:', error);
        alert('❌ Có lỗi xảy ra khi đánh dấu hoàn thành. Vui lòng thử lại.');
      }
    }
  };

  if (showResults) {
    const allQuestionsAnswered = questions.every((question, index) => {
      const questionKey = question.id || `question_${index}`;
      return userAnswers[questionKey] !== undefined && userAnswers[questionKey] !== '';
    });
    
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>🎉 Kết quả bài kiểm tra</h3>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#007bff',
          marginBottom: '20px'
        }}>
          {score}/{questions.length} câu đúng
        </div>
        <div style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          marginBottom: '30px'
        }}>
          Điểm số: {Math.round((score / questions.length) * 100)}%
        </div>
        
        {!allQuestionsAnswered && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              ⚠️ Bạn chưa trả lời hết tất cả câu hỏi ({Object.keys(userAnswers).length}/{questions.length})
            </p>
            <button 
              onClick={handleCompletePassage}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ✅ Hoàn thành bài học
            </button>
          </div>
        )}
        
        <button 
          onClick={resetQuiz}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          🔄 Làm lại
        </button>
      </div>
    );
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    // Chỉ lấy đáp án nếu câu hỏi hiện tại đã có đáp án
    // Nếu chưa có đáp án, trả về undefined để không hiển thị đáp án nào được chọn
    const questionKey = currentQuestion.id || `question_${currentQuestionIndex}`;
    const userAnswer = userAnswers[questionKey];
    
    // Debug log để kiểm tra
    console.log(`🔍 Question ${currentQuestionIndex + 1} (ID: ${currentQuestion.id}, Key: ${questionKey}):`, {
      userAnswer,
      allAnswers: userAnswers
    });

    return (
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '12px',
          marginBottom: '15px'
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: '#333',
            fontSize: '1.2rem'
          }}>
            Câu {currentQuestionIndex + 1}/{questions.length}
          </h4>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#555',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            {currentQuestion.question}
          </p>

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQuestion.options.map((option, index) => (
                <label key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: userAnswer === index ? '#e3f2fd' : 'white',
                  borderColor: userAnswer === index ? '#2196f3' : '#e9ecef',
                  transition: 'all 0.3s ease'
                }}>
                  <input
                    type="radio"
                    name={`question_${questionKey}`}
                    value={index}
                    checked={userAnswer === index}
                    onChange={() => {
                      console.log(`📝 Answering question ${questionKey} with option ${index}`);
                      handleAnswer(index);
                    }}
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '1rem' }}>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: userAnswer === true ? '#e8f5e8' : 'white',
                borderColor: userAnswer === true ? '#4caf50' : '#e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name={`question_${questionKey}`}
                  checked={userAnswer === true}
                  onChange={() => {
                    console.log(`📝 Answering question ${questionKey} with TRUE`);
                    handleAnswer(true);
                  }}
                  style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>✅ Đúng</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: userAnswer === false ? '#ffeaea' : 'white',
                borderColor: userAnswer === false ? '#f44336' : '#e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name={`question_${questionKey}`}
                  checked={userAnswer === false}
                  onChange={() => {
                    console.log(`📝 Answering question ${questionKey} with FALSE`);
                    handleAnswer(false);
                  }}
                  style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>❌ Sai</span>
              </label>
            </div>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <div>
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => {
                  console.log(`📝 Answering question ${questionKey} with text:`, e.target.value);
                  handleAnswer(e.target.value);
                }}
                placeholder="Nhập câu trả lời của bạn..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: currentQuestionIndex === 0 ? '#f8f9fa' : '#6c757d',
              color: currentQuestionIndex === 0 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Câu trước
          </button>

          <span style={{ 
            fontSize: '0.9rem', 
            color: '#666',
            fontWeight: '500'
          }}>
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          <button
            onClick={handleNextQuestion}
            disabled={userAnswer === undefined || userAnswer === ''}
            style={{
              padding: '10px 20px',
              backgroundColor: (userAnswer === undefined || userAnswer === '') ? '#f8f9fa' : '#007bff',
              color: (userAnswer === undefined || userAnswer === '') ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (userAnswer === undefined || userAnswer === '') ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp →'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '8px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <p style={{ margin: '0', color: '#e17055', fontSize: '0.9rem', fontWeight: '500' }}>
          ⚠️ Bạn phải trả lời tất cả các câu hỏi để hoàn thành bài học này.
        </p>
      </div>

      {/* Thêm key để đảm bảo component re-render khi chuyển câu hỏi */}
      <div key={`question-${currentQuestionIndex}-${currentQuestion?.id}`}>
        {renderQuestion()}
      </div>
    </div>
  );
};

export default QuizSection;