import React from 'react';
import { vocabularyData } from '../data/vocabulary';
import { vocabularyService } from '../firebase/vocabularyService';
import { topicSeeds, passageSeeds, longPassageSeeds } from '../data/topics';
import { topicService } from '../firebase/topicService';
import { passageService } from '../firebase/passageService';
import { vocabService } from '../firebase/vocabService';
import { vocabSeeds } from '../data/vocab';
import { questionSeeds } from '../data/questions';
import { questionService } from '../firebase/questionService';
import { Question } from '../types';

const AdminPanel: React.FC = () => {
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

      let uploaded = 0;
      for (const q of questionSeeds) {
        const realPassageId = passageMap.get(q.passageId);
        if (realPassageId) {
          await questionService.add({ ...q, passageId: realPassageId });
          uploaded++;
        }
      }
      alert(`✅ Đã upload ${uploaded} câu hỏi!`);
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

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔧 Admin Panel</h4>
      <button 
        className="button" 
        onClick={uploadSampleData}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Upload dữ liệu mẫu
      </button>

      <div style={{ height: 8 }} />

      <button 
        className="button" 
        onClick={uploadTopicsAndPassages}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Upload Topics & Passages
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={fixDuplicatesAndUpdateTravel}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Dọn trùng & cập nhật ảnh Travel
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={uploadLongPassages}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Upload các đoạn văn dài (400-500 chữ)
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={reuploadLongPassagesWithVocabDetails}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Upload bản có Flashcard details (ảnh/IPA/giải thích/ví dụ)
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={quickSetVocabImage}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Gán ảnh nhanh cho 1 từ vựng
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={seedVocabCollection}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Tạo collection vocab (car, mist)
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={checkVocabData}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Kiểm tra dữ liệu vocab hiện tại
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={forceRefreshVocab}
        style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#ff6b6b' }}
      >
        🔄 Làm mới dữ liệu vocab hoàn toàn
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={uploadQuestions}
        style={{ fontSize: '0.9rem', padding: '8px 15px' }}
      >
        Upload câu hỏi cho đoạn văn
      </button>

      <div style={{ height: 8 }} />

      <button
        className="button"
        onClick={checkQuestionsData}
        style={{ fontSize: '0.9rem', padding: '8px 15px', backgroundColor: '#74b9ff' }}
      >
        Kiểm tra câu hỏi trong database
      </button>
    </div>
  );
};

export default AdminPanel;

