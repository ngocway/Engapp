import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { progressService } from '../firebase/progressService';
import { useAuth } from '../contexts/AuthContext';

interface QuizSectionProps {
  questions: Question[];
  passageId: string;
}

const QuizSection: React.FC<QuizSectionProps> = ({ questions, passageId }) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    return (
      <div className="quiz-results">
        <h3>Quiz Results</h3>
        <p>Your score: {score}/{questions.length}</p>
        <button onClick={handleRestart}>Try Again</button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  return (
    <div className="quiz-section">
      <h3>Quiz</h3>
      <div className="quiz-progress">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      
      <div className="question">
        <h4>{currentQuestion.question}</h4>
        <div className="answers">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              className={`answer-option ${
                selectedAnswers[currentQuestion.id] === option ? 'selected' : ''
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={handleNext}
        disabled={!selectedAnswers[currentQuestion.id]}
        className="next-button"
      >
        {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
      </button>
    </div>
  );
};

export default QuizSection;