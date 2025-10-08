import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vocabularyData } from '../data/vocabulary';
import { vocabularyService } from '../firebase/vocabularyService';
import { topicSeeds, passageSeeds, longPassageSeeds } from '../data/topics';
import { topicService } from '../firebase/topicService';
import { passageService } from '../firebase/passageService';
import { vocabService } from '../firebase/vocabService';
import { vocabSeeds } from '../data/vocab';
import { questionService } from '../firebase/questionService';
import { Question } from '../types';
import AdminPassageManager from './AdminPassageManager';
import Header from './Header';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [showPassageManager, setShowPassageManager] = useState(false);

  const handleTabChange = (tab: 'topics' | 'review') => {
    if (tab === 'topics') {
      navigate('/');
    } else if (tab === 'review') {
      navigate('/review');
    }
  };

  const uploadSampleData = async () => {
    console.log('🚀 Bắt đầu upload dữ liệu mẫu lên Firebase...');
    
    try {
      // Upload từ vựng
      for (const word of vocabularyData) {
        const { id, ...wordData } = word;
        const docId = await vocabularyService.addVocabulary(wordData);
        
        if (docId) {
          console.log(`✅ Đã upload từ: ${word.word} với ID: ${docId}`);
        } else {
          console.error(`❌ Lỗi khi upload từ: ${word.word}`);
        }
      }
      
      alert('🎉 Hoàn thành upload dữ liệu mẫu!');
    } catch (error) {
      console.error('❌ Lỗi khi upload dữ liệu:', error);
      alert('❌ Có lỗi xảy ra khi upload dữ liệu');
    }
  };

  const uploadTopicsAndPassages = async () => {
    console.log('🚀 Upload topics & passages ...');
    try {
      for (const t of topicSeeds) {
        await topicService.add(t);
      }
      for (const p of passageSeeds) {
        await passageService.add(p);
      }
      alert('🎉 Đã upload Topics và Passages!');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi upload Topics/Passages');
    }
  };

  const fixDuplicatesAndUpdateTravel = async () => {
    try {
      // 1) Deduplicate topics by slug (keep first)
      const all = await topicService.getAll();
      const seen = new Set<string>();
      for (const t of all) {
        if (t.slug) {
          const key = t.slug.toLowerCase();
          if (seen.has(key)) {
            await topicService.deleteById(t.id);
          } else {
            seen.add(key);
          }
        }
      }

      // 2) Update Travel thumbnail on the remaining one
      const travelList = await topicService.getBySlug('travel');
      if (travelList.length > 0) {
        const keep = travelList[0];
        await topicService.updateById(keep.id, {
          thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
        });
        // Delete excess travel duplicates if any left
        for (let i = 1; i < travelList.length; i++) {
          await topicService.deleteById(travelList[i].id);
        }
      }

      // 3) Deduplicate passages by title within each topic
      await Promise.all([
        'travel',
        'daily-activities',
        'nature'
      ].map(slug => passageService.removeDuplicatesByTitle(slug)));

      alert('✅ Đã xóa dữ liệu trùng lặp và cập nhật ảnh Travel.');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi dọn trùng hoặc cập nhật ảnh');
    }
  };

  const uploadLongPassages = async () => {
    try {
      for (const p of longPassageSeeds) {
        await passageService.add(p);
      }
      alert('✅ Đã upload các đoạn văn dài kèm từ vựng mới!');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi upload long passages');
    }
  };

  const reuploadLongPassagesWithVocabDetails = async () => {
    try {
      // Simply add again; duplicates by title can be cleaned using the duplicate cleaner if needed
      for (const p of longPassageSeeds) {
        await passageService.add(p);
      }
      alert('✅ Đã upload bản chi tiết (ảnh/IPA/explanations/examples) cho vocab!');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi upload chi tiết vocab');
    }
  };

  const quickSetVocabImage = async () => {
    const term = prompt('Nhập từ vựng muốn gán ảnh (ví dụ: mist)');
    if (!term) return;
    const url = prompt('Dán URL ảnh (để trống dùng ảnh mặc định)') 
      || 'https://images.unsplash.com/photo-1520975922323-2965c33fe8ea?w=400&auto=format&fit=crop';
    const count = await passageService.setVocabImageByTerm(term, url);
    alert(`✅ Đã gán ảnh cho ${count} passage có từ "${term}"`);
  };

  const uploadQuestions = async () => {
    try {
      // Get all passages to map question passageId
      const allPassages = await passageService.getAll();
      const passageMap = new Map();
      allPassages.forEach((p: any) => {
        if (p.title.includes('First Time Flying Alone')) passageMap.set('temp-travel-1', p.id);
        if (p.title.includes('Productive School Day')) passageMap.set('temp-daily-1', p.id);
        if (p.title.includes('Morning by the Lake')) passageMap.set('temp-nature-1', p.id);
      });

      // Questions will be added manually through the admin interface
      console.log('✅ Questions can be added through the admin interface');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi upload câu hỏi');
    }
  };

  const seedVocabCollection = async () => {
    try {
      for (const v of vocabSeeds) {
        await vocabService.add(v);
      }
      alert('✅ Đã tạo collection vocab với các từ mẫu (car, mist).');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi seed vocab');
    }
  };

  const checkVocabData = async () => {
    try {
      const allVocabs = await vocabService.getAll();
      console.log('Current vocab data:', allVocabs);
      alert(`📊 Hiện có ${allVocabs.length} từ vựng trong database. Xem console để chi tiết.`);
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi kiểm tra dữ liệu vocab');
    }
  };

  const checkQuestionsData = async () => {
    try {
      const allQuestions = await questionService.getAll();
      const allPassages = await passageService.getAll();
      
      console.log('Current questions data:', allQuestions);
      console.log('Current passages data:', allPassages);
      
      // Tạo map từ passageId sang title
      const passageMap = new Map();
      allPassages.forEach(p => {
        passageMap.set(p.id, p.title);
      });
      
      // Phân loại câu hỏi theo đoạn văn
      const questionsByPassage = allQuestions.reduce((acc: Record<string, Question[]>, q: Question) => {
        const passageTitle = passageMap.get(q.passageId) || `Unknown (${q.passageId})`;
        if (!acc[passageTitle]) {
          acc[passageTitle] = [];
        }
        acc[passageTitle].push(q);
        return acc;
      }, {} as Record<string, Question[]>);

      console.log('Questions by passage:', questionsByPassage);
      
      let message = `📊 Hiện có ${allQuestions.length} câu hỏi trong database:\n\n`;
      Object.entries(questionsByPassage).forEach(([passageTitle, questions]) => {
        message += `📖 ${passageTitle}: ${questions.length} câu hỏi\n`;
        questions.forEach((q, index) => {
          message += `  ${index + 1}. ${q.question.substring(0, 50)}...\n`;
        });
        message += '\n';
      });
      
      // Kiểm tra đặc biệt cho "Morning by the Lake"
      const morningLakeQuestions = allQuestions.filter(q => {
        const passageTitle = passageMap.get(q.passageId);
        return passageTitle && passageTitle.toLowerCase().includes('morning') && passageTitle.toLowerCase().includes('lake');
      });
      
      if (morningLakeQuestions.length > 0) {
        message += `✅ Tìm thấy ${morningLakeQuestions.length} câu hỏi cho "Morning by the Lake"!\n`;
      } else {
        message += `❌ Chưa có câu hỏi nào cho "Morning by the Lake"\n`;
      }
      
      alert(message + '\nXem console để chi tiết.');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi kiểm tra dữ liệu câu hỏi');
    }
  };

  const forceRefreshVocab = async () => {
    try {
      // Xóa tất cả vocab cũ
      const allVocabs = await vocabService.getAll();
      for (const vocab of allVocabs) {
        await vocabService.delete(vocab.id!);
      }
      
      // Thêm lại dữ liệu mới
      for (const v of vocabSeeds) {
        await vocabService.add(v);
      }
      
      alert('✅ Đã làm mới dữ liệu vocab hoàn toàn!');
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi làm mới dữ liệu vocab');
    }
  };

  if (showPassageManager) {
    return (
      <div className="app">
        <Header onTabChange={handleTabChange} activeTab="topics" />
        <main className="main">
          <AdminPassageManager onClose={() => setShowPassageManager(false)} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onTabChange={handleTabChange} activeTab="topics" />
      <main className="main">
        <div className="admin-panel-container">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-icon">🔧</span>
          <h1>Admin Panel</h1>
        </div>
        <p className="admin-subtitle">Quản lý nội dung học tiếng Anh</p>
        <div className="admin-status">
          <span className="status-icon">⚠️</span>
          <span className="status-text">Development Mode - Auth disabled</span>
        </div>
      </div>

      <div className="admin-content">
        {/* Passage Management Section */}
        <div className="admin-section">
          <h2 className="section-title">📚 Quản lý bài học</h2>
          <div className="admin-grid">
            <button className="admin-button primary" onClick={() => setShowPassageManager(true)}>
              <span className="button-icon">📝</span>
              <span className="button-text">Quản lý bài học</span>
            </button>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="admin-section">
          <h2 className="section-title">📊 Quản lý dữ liệu</h2>
          <div className="admin-grid">
            <button className="admin-button primary" onClick={uploadSampleData}>
              <span className="button-icon">📤</span>
              <span className="button-text">Upload dữ liệu mẫu</span>
            </button>
            
            <button className="admin-button primary" onClick={uploadTopicsAndPassages}>
              <span className="button-icon">📚</span>
              <span className="button-text">Upload Topics & Passages</span>
            </button>
            
            <button className="admin-button primary" onClick={uploadLongPassages}>
              <span className="button-icon">📄</span>
              <span className="button-text">Upload đoạn văn dài</span>
            </button>
            
            <button className="admin-button primary" onClick={reuploadLongPassagesWithVocabDetails}>
              <span className="button-icon">🎴</span>
              <span className="button-text">Upload Flashcard details</span>
            </button>
          </div>
        </div>

        {/* Vocabulary Management Section */}
        <div className="admin-section">
          <h2 className="section-title">📝 Quản lý từ vựng</h2>
          <div className="admin-grid">
            <button className="admin-button secondary" onClick={seedVocabCollection}>
              <span className="button-icon">➕</span>
              <span className="button-text">Tạo collection vocab</span>
            </button>
            
            <button className="admin-button secondary" onClick={quickSetVocabImage}>
              <span className="button-icon">🖼️</span>
              <span className="button-text">Gán ảnh từ vựng</span>
            </button>
            
            <button className="admin-button secondary" onClick={checkVocabData}>
              <span className="button-icon">🔍</span>
              <span className="button-text">Kiểm tra dữ liệu vocab</span>
            </button>
            
            <button className="admin-button danger" onClick={forceRefreshVocab}>
              <span className="button-icon">🔄</span>
              <span className="button-text">Làm mới vocab hoàn toàn</span>
            </button>
          </div>
        </div>

        {/* Questions Management Section */}
        <div className="admin-section">
          <h2 className="section-title">❓ Quản lý câu hỏi</h2>
          <div className="admin-grid">
            <button className="admin-button secondary" onClick={uploadQuestions}>
              <span className="button-icon">📝</span>
              <span className="button-text">Upload câu hỏi</span>
            </button>
            
            <button className="admin-button info" onClick={checkQuestionsData}>
              <span className="button-icon">📊</span>
              <span className="button-text">Kiểm tra câu hỏi database</span>
            </button>
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="admin-section">
          <h2 className="section-title">🔧 Bảo trì hệ thống</h2>
          <div className="admin-grid">
            <button className="admin-button warning" onClick={fixDuplicatesAndUpdateTravel}>
              <span className="button-icon">🧹</span>
              <span className="button-text">Dọn trùng & cập nhật ảnh</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </main>
    </div>
  );
};

export default AdminPanel;

