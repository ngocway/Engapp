import React, { useState, useEffect } from 'react';
import { updateVocabularyImages } from '../scripts/updateVocabularyImages';
import { authService } from '../firebase/authService';

const ImageUpdateButton: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    const checkAdminStatus = (user: any) => {
      setIsAdmin(authService.isAdmin(user));
    };

    // Initial check
    checkAdminStatus(authService.getCurrentUser());

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe();
  }, []);

  if (!isAdmin) return null;

  const handleUpdateImages = async () => {
    setIsUpdating(true);
    setUpdateStatus('Đang cập nhật ảnh từ vựng...');

    try {
      await updateVocabularyImages();
      setUpdateStatus('✅ Hoàn thành cập nhật ảnh từ vựng!');
    } catch (error) {
      setUpdateStatus('❌ Lỗi khi cập nhật: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🖼️ Cập nhật ảnh từ vựng</h3>
      <button
        onClick={handleUpdateImages}
        disabled={isUpdating}
        style={{
          background: isUpdating ? '#6b7280' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {isUpdating ? '⏳ Đang cập nhật...' : '🚀 Cập nhật ảnh'}
      </button>
      {updateStatus && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: updateStatus.includes('✅') ? '#059669' : updateStatus.includes('❌') ? '#dc2626' : '#6b7280'
        }}>
          {updateStatus}
        </div>
      )}
    </div>
  );
};

export default ImageUpdateButton;


