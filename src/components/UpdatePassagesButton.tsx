import React, { useState } from 'react';
import { updateAllPassages } from '../scripts/updateAllPassages';

const UpdatePassagesButton: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  const handleUpdateAllPassages = async () => {
    if (!window.confirm('Bạn có chắc muốn cập nhật tất cả passages với lessonType="Đoạn văn" và accessType="Miễn phí"?\n\nThao tác này sẽ cập nhật tất cả bài học trong database.')) {
      return;
    }

    setIsUpdating(true);
    setUpdateResult(null);

    try {
      await updateAllPassages();
      setUpdateResult('✅ Cập nhật thành công! Tất cả passages đã được cập nhật với lessonType="Đoạn văn" và accessType="Miễn phí".');
    } catch (error) {
      console.error('Error updating passages:', error);
      setUpdateResult(`❌ Lỗi khi cập nhật: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-content">
        <h3 className="admin-title">
          <span className="admin-icon">🔄</span>
          <span>Cập nhật Passages</span>
        </h3>
        
        <p className="admin-subtitle">
          Cập nhật tất cả bài học với lessonType="Đoạn văn" và accessType="Miễn phí"
        </p>
        
        <div className="admin-grid">
          <button
            className="admin-button primary"
            onClick={handleUpdateAllPassages}
            disabled={isUpdating}
          >
            <span className="button-icon">
              {isUpdating ? '⏳' : '🔄'}
            </span>
            <span className="button-text">
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tất cả Passages'}
            </span>
          </button>
        </div>
        
        {updateResult && (
          <div className="update-result">
            <p style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: updateResult.includes('✅') ? '#d4edda' : '#f8d7da',
              color: updateResult.includes('✅') ? '#155724' : '#721c24',
              border: `1px solid ${updateResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
              marginTop: '15px',
              fontSize: '14px'
            }}>
              {updateResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePassagesButton;
