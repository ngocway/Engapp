import React from 'react';
import AdminQuestionsPageComponent from '../components/AdminQuestionsPage';
import SimpleHeader from '../components/SimpleHeader';

const AdminQuestionsPage: React.FC = () => {
  return (
    <div className="app">
      <SimpleHeader />
      <main className="main">
        <AdminQuestionsPageComponent />
      </main>
    </div>
  );
};

export default AdminQuestionsPage;
