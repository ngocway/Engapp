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
import UpdatePassagesButton from './UpdatePassagesButton';
import { useAdmin } from '../contexts/AdminContext';
import { ContentGeneratorService } from '../services/contentGeneratorService';
import '../pages/AdminPage.css';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [showPassageManager, setShowPassageManager] = useState(false);

  // Remove handleTabChange since admin doesn't need user navigation

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

  const generateAutoContent = async () => {
    const confirmed = window.confirm(
      '🚀 Bạn có chắc chắn muốn tạo 20 bài văn cho mỗi chủ đề?\n\n' +
      'Mỗi bài văn sẽ có:\n' +
      '• 8 từ vựng mới (trong dấu [])\n' +
      '• 8 câu hỏi (3 multiple choice, 3 fill blank, 2 true/false)\n' +
      '• English level, layout ratio, thumbnail tự động\n\n' +
      'Quá trình này có thể mất vài phút. Tiếp tục?'
    );
    
    if (!confirmed) return;

    try {
      console.log('🚀 Bắt đầu tạo nội dung tự động...');
      await ContentGeneratorService.generatePassagesForAllTopics();
      alert('🎉 Hoàn thành! Đã tạo 20 bài văn cho mỗi chủ đề với từ vựng và câu hỏi!');
    } catch (error) {
      console.error('❌ Lỗi khi tạo nội dung tự động:', error);
      alert('❌ Có lỗi xảy ra khi tạo nội dung tự động. Xem console để chi tiết.');
    }
  };

  const generateContentForTopic = async () => {
    const topicSlug = prompt('Nhập slug của chủ đề (travel, daily-activities, nature):');
    if (!topicSlug) return;

    const countStr = prompt('Nhập số lượng bài văn muốn tạo (mặc định 20):');
    const count = countStr ? parseInt(countStr) : 20;

    if (isNaN(count) || count <= 0) {
      alert('❌ Số lượng không hợp lệ!');
      return;
    }

    const confirmed = window.confirm(
      `🚀 Bạn có chắc chắn muốn tạo ${count} bài văn cho chủ đề "${topicSlug}"?\n\n` +
      'Mỗi bài văn sẽ có:\n' +
      '• 8 từ vựng mới (trong dấu [])\n' +
      '• 8 câu hỏi (3 multiple choice, 3 fill blank, 2 true/false)\n' +
      '• English level, layout ratio, thumbnail tự động\n\n' +
      'Tiếp tục?'
    );
    
    if (!confirmed) return;

    try {
      console.log(`🚀 Bắt đầu tạo ${count} bài văn cho chủ đề: ${topicSlug}`);
      await ContentGeneratorService.generatePassagesForTopic(topicSlug, count);
      alert(`🎉 Hoàn thành! Đã tạo ${count} bài văn cho chủ đề "${topicSlug}"!`);
    } catch (error) {
      console.error(`❌ Lỗi khi tạo nội dung cho chủ đề ${topicSlug}:`, error);
      alert(`❌ Có lỗi xảy ra khi tạo nội dung cho chủ đề "${topicSlug}". Xem console để chi tiết.`);
    }
  };

  const testGenerateOnePassage = async () => {
    try {
      console.log('🧪 Test tạo 1 bài văn...');
      await ContentGeneratorService.generatePassagesForTopic('travel', 1);
      alert('✅ Test thành công! Đã tạo 1 bài văn cho chủ đề travel.');
    } catch (error) {
      console.error('❌ Test thất bại:', error);
      alert('❌ Test thất bại. Xem console để chi tiết.');
    }
  };

  const testFirebaseConnection = async () => {
    try {
      console.log('🔍 Test kết nối Firebase...');
      
      // Test topics
      const topics = await topicService.getAll();
      console.log('📚 Topics:', topics);
      
      // Test passages
      const passages = await passageService.getAll();
      console.log('📖 Passages:', passages);
      
      // Test questions
      const questions = await questionService.getAll();
      console.log('❓ Questions:', questions);
      
      let message = `✅ Firebase kết nối OK!\n📚 Topics: ${topics.length}\n📖 Passages: ${passages.length}\n❓ Questions: ${questions.length}`;
      
      if (topics.length === 0) {
        message += '\n\n⚠️ CẢNH BÁO: Không có topics nào trong database!';
        message += '\nHãy chạy "Upload Topics & Passages" trước khi tạo bài văn tự động.';
      } else {
        // Check if topics have level field
        const topicsWithoutLevel = topics.filter(t => typeof t.level !== 'number');
        if (topicsWithoutLevel.length > 0) {
          message += `\n\n⚠️ CẢNH BÁO: ${topicsWithoutLevel.length} topics không có trường level!`;
          message += '\nHãy chạy "Sửa lỗi topics" để khắc phục.';
        }
      }
      
      alert(message);
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      alert('❌ Lỗi kết nối Firebase. Xem console để chi tiết.');
    }
  };

  const fixTopicsLevel = async () => {
    try {
      console.log('🔧 Đang sửa lỗi level cho topics...');
      
      const topics = await topicService.getAll();
      let fixedCount = 0;
      
      for (const topic of topics) {
        if (typeof topic.level !== 'number') {
          console.log(`🔧 Sửa topic: ${topic.title} - level từ ${topic.level} thành 1`);
          await topicService.updateById(topic.id, { level: 1 });
          fixedCount++;
        }
      }
      
      alert(`✅ Đã sửa ${fixedCount} topics. Tất cả topics giờ đã có trường level hợp lệ.`);
    } catch (error) {
      console.error('❌ Lỗi khi sửa topics:', error);
      alert('❌ Lỗi khi sửa topics. Xem console để chi tiết.');
    }
  };

  const checkPassageThumbnails = async () => {
    try {
      console.log('🔍 Kiểm tra thumbnail của passages...');
      
      const passages = await passageService.getAll();
      let noThumbnailCount = 0;
      let invalidThumbnailCount = 0;
      
      for (const passage of passages) {
        if (!passage.thumbnail || passage.thumbnail.trim() === '') {
          console.log(`❌ Passage "${passage.title}" không có thumbnail`);
          noThumbnailCount++;
        } else {
          // Test if thumbnail URL is valid
          try {
            const response = await fetch(passage.thumbnail, { method: 'HEAD' });
            if (!response.ok) {
              console.log(`❌ Passage "${passage.title}" có thumbnail không hợp lệ: ${passage.thumbnail}`);
              invalidThumbnailCount++;
            }
          } catch (error) {
            console.log(`❌ Passage "${passage.title}" có thumbnail không load được: ${passage.thumbnail}`);
            invalidThumbnailCount++;
          }
        }
      }
      
      let message = `📊 Kết quả kiểm tra thumbnail:\n`;
      message += `📖 Tổng passages: ${passages.length}\n`;
      message += `❌ Không có thumbnail: ${noThumbnailCount}\n`;
      message += `⚠️ Thumbnail không hợp lệ: ${invalidThumbnailCount}\n`;
      message += `✅ Thumbnail OK: ${passages.length - noThumbnailCount - invalidThumbnailCount}`;
      
      alert(message);
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra thumbnails:', error);
      alert('❌ Lỗi khi kiểm tra thumbnails. Xem console để chi tiết.');
    }
  };

  const fixPassageThumbnails = async () => {
    try {
      console.log('🔧 Đang sửa thumbnail cho passages...');
      
      const passages = await passageService.getAll();
      let fixedCount = 0;
      
      for (const passage of passages) {
        if (!passage.thumbnail || passage.thumbnail.trim() === '') {
          // Generate a new thumbnail URL
          const newThumbnail = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
          
          console.log(`🔧 Sửa passage: ${passage.title} - thêm thumbnail mới`);
          await passageService.update(passage.id, { thumbnail: newThumbnail });
          fixedCount++;
        }
      }
      
      alert(`✅ Đã sửa ${fixedCount} passages. Tất cả passages giờ đã có thumbnail.`);
    } catch (error) {
      console.error('❌ Lỗi khi sửa thumbnails:', error);
      alert('❌ Lỗi khi sửa thumbnails. Xem console để chi tiết.');
    }
  };

  const fixAllThumbnails = async () => {
    try {
      console.log('🔧 Đang sửa TẤT CẢ thumbnail cho passages...');
      
      const passages = await passageService.getAll();
      let fixedCount = 0;
      
      for (const passage of passages) {
        // Generate a new thumbnail URL for ALL passages
        const newThumbnail = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
        
        console.log(`🔧 Sửa passage: ${passage.title} - cập nhật thumbnail mới`);
        await passageService.update(passage.id, { thumbnail: newThumbnail });
        fixedCount++;
      }
      
      alert(`✅ Đã sửa ${fixedCount} passages. Tất cả passages giờ đã có thumbnail mới từ Picsum.`);
    } catch (error) {
      console.error('❌ Lỗi khi sửa tất cả thumbnails:', error);
      alert('❌ Lỗi khi sửa tất cả thumbnails. Xem console để chi tiết.');
    }
  };

  if (showPassageManager) {
    return (
      <div className="admin-dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src="https://i.ibb.co/6bPZYBn/logo.png" alt="EngApp Logo" />
            <h2>EngApp</h2>
          </div>
        <nav className="sidebar-menu">
          <a href="#" className="menu-item">
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-book"></i> Bài học
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-language"></i> Từ vựng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-user-gear"></i> Người dùng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-chart-line"></i> Thống kê
          </a>
          <button className="menu-item active">
            <i className="fa-solid fa-screwdriver-wrench"></i> Admin Panel
          </button>
        </nav>
          <button className="logout-sidebar" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </aside>
        <main className="main-content">
          <AdminPassageManager onClose={() => setShowPassageManager(false)} />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="https://i.ibb.co/6bPZYBn/logo.png" alt="EngApp Logo" />
          <h2>EngApp</h2>
        </div>
        <nav className="sidebar-menu">
          <a href="#" className="menu-item">
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-book"></i> Bài học
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-language"></i> Từ vựng
          </a>
          <a href="#" className="menu-item">
            <i className="fa-solid fa-user-gear"></i> Người dùng
          </a>
          <a href="#" className="menu-item active">
            <i className="fa-solid fa-chart-line"></i> Thống kê
          </a>
        </nav>
        <button className="logout-sidebar" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </aside>
      <main className="main-content">
        <div className="admin-panel-container">

          <div className="admin-panel-content">
            <div className="admin-title">
              <span className="admin-icon">🔧</span>
              <h2>Admin Panel</h2>
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
                
                <button className="admin-button success" onClick={generateAutoContent}>
                  <span className="button-icon">🤖</span>
                  <span className="button-text">Tạo 20 bài văn cho tất cả chủ đề</span>
                </button>
                
                <button className="admin-button success" onClick={generateContentForTopic}>
                  <span className="button-icon">🎯</span>
                  <span className="button-text">Tạo bài văn cho chủ đề cụ thể</span>
                </button>
                
                <button className="admin-button info" onClick={checkPassageThumbnails}>
                  <span className="button-icon">🔍</span>
                  <span className="button-text">Kiểm tra thumbnail</span>
                </button>
                
                <button className="admin-button warning" onClick={fixPassageThumbnails}>
                  <span className="button-icon">🖼️</span>
                  <span className="button-text">Sửa thumbnail</span>
                </button>
                
                <button className="admin-button danger" onClick={fixAllThumbnails}>
                  <span className="button-icon">🔄</span>
                  <span className="button-text">Sửa TẤT CẢ thumbnail</span>
                </button>
              </div>
              
              {/* Update Passages Section */}
              <UpdatePassagesButton />
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

