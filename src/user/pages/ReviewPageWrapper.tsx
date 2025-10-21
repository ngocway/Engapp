import React from 'react';
import MainLayout from '../components/MainLayout';

const ReviewPageWrapper: React.FC = () => {
  // Tạo một component wrapper đặc biệt cho route /review
  // để đảm bảo tab review được chọn khi truy cập trực tiếp
  return <MainLayout initialTab="review" />;
};

export default ReviewPageWrapper;
