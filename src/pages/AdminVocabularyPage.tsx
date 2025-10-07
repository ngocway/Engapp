import React from 'react';
import AdminVocabularyPageComponent from '../components/AdminVocabularyPage';
import SimpleHeader from '../components/SimpleHeader';

const AdminVocabularyPage: React.FC = () => {
  return (
    <div className="app">
      <SimpleHeader />
      <main className="main">
        <AdminVocabularyPageComponent />
      </main>
    </div>
  );
};

export default AdminVocabularyPage;
