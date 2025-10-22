import React from 'react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  title?: string;
  description?: string;
  loginButtonIcon?: string;
  loginButtonText?: string;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  title = "🔒 Bài học Premium",
  description = "Bài học này dành cho thành viên Premium.<br />Vui lòng đăng nhập để tiếp tục học bài này.",
  loginButtonIcon = "🔑",
  loginButtonText = "Đăng nhập"
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="subtitle" dangerouslySetInnerHTML={{ __html: description }}></p>
        
        <div className="benefits">
          <h3>Lợi ích khi đăng nhập:</h3>
          <ul>
            <li>✔️ Truy cập tất cả bài học Premium</li>
            <li>✔️ Theo dõi tiến độ học tập</li>
            <li>✔️ Lưu từ vựng yêu thích</li>
            <li>✔️ Nhận gợi ý bài học phù hợp</li>
          </ul>
        </div>
        
        <div className="actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
          >
            Hủy
          </button>
          <button 
            className="login-btn" 
            onClick={onLogin}
          >
            {loginButtonIcon} {loginButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;