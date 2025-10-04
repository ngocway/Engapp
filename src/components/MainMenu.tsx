import React from 'react';
import { GameMode } from '../types';

interface MainMenuProps {
  onModeSelect: (mode: GameMode) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onModeSelect }) => {
  return (
    <div className="main-content">
      <div className="menu-grid">
        <div 
          className="menu-card" 
          onClick={() => onModeSelect('topicSelect')}
        >
          <span className="icon">📚</span>
          <h2>Đọc Đoạn Văn</h2>
          <p>
            Chọn chủ đề yêu thích và đọc những đoạn văn thú vị. 
            Học từ vựng mới qua flashcard tương tác!
          </p>
        </div>

        <div 
          className="menu-card" 
          onClick={() => onModeSelect('vocabulary')}
        >
          <span className="icon">🎓</span>
          <h2>Học Từ Vựng</h2>
          <p>
            Khám phá những từ tiếng Anh mới với hình ảnh đẹp và phát âm chuẩn. 
            Nhấn vào từ để nghe cách đọc!
          </p>
        </div>

        <div 
          className="menu-card" 
          onClick={() => onModeSelect('sentence')}
        >
          <span className="icon">📝</span>
          <h2>Học Đặt Câu</h2>
          <p>
            Luyện tập cách sắp xếp từ thành câu hoàn chỉnh. 
            Kéo thả các từ để tạo câu đúng!
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>
          🌟 Học tiếng Anh thật vui vẻ!
        </h3>
        <p style={{ color: 'white', fontSize: '1.1rem', opacity: 0.9 }}>
          Chọn một hoạt động để bắt đầu học tập nhé!
        </p>
      </div>
    </div>
  );
};

export default MainMenu;



