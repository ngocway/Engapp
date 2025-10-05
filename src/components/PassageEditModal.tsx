import React, { useState, useEffect } from 'react';
import { Passage } from '../types';
import { passageService } from '../firebase/passageService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

interface PassageEditModalProps {
  passage: Passage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (passage: Passage) => void;
}

const PassageEditModal: React.FC<PassageEditModalProps> = ({ 
  passage, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    excerpt: '',
    topicSlug: '',
    thumbnail: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (passage) {
      setFormData({
        title: passage.title || '',
        text: passage.text || '',
        excerpt: passage.excerpt || '',
        topicSlug: passage.topicSlug || '',
        thumbnail: passage.thumbnail || ''
      });
      setPreviewUrl(passage.thumbnail || '');
    } else {
      setFormData({
        title: '',
        text: '',
        excerpt: '',
        topicSlug: '',
        thumbnail: ''
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
  }, [passage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is selected
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is dropped
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `passages/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      setUploading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage) return;

    setLoading(true);
    try {
      let thumbnailUrl = formData.thumbnail;
      
      // Upload file if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        } else {
          alert('Lỗi khi upload ảnh. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      const updatedPassage: Passage = {
        ...passage,
        title: formData.title,
        text: formData.text,
        excerpt: formData.excerpt,
        topicSlug: formData.topicSlug,
        thumbnail: thumbnailUrl,
        level: passage.level,
        topicId: passage.topicId
      };

      await passageService.update(passage.id, updatedPassage);
      onSave(updatedPassage);
      onClose();
      alert('Đã cập nhật đoạn văn thành công!');
    } catch (error) {
      console.error('Error updating passage:', error);
      alert('Lỗi khi cập nhật đoạn văn');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✏️ Sửa đoạn văn</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề:</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Nhập tiêu đề đoạn văn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Tóm tắt:</label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Nhập tóm tắt ngắn gọn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="text">Nội dung:</label>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={8}
              required
              placeholder="Nhập nội dung đoạn văn đầy đủ"
            />
          </div>

          <div className="form-group">
            <label htmlFor="topicSlug">Chủ đề:</label>
            <select
              id="topicSlug"
              value={formData.topicSlug}
              onChange={(e) => setFormData({ ...formData, topicSlug: e.target.value })}
              required
            >
              <option value="">Chọn chủ đề</option>
              <option value="nature">🌿 Thiên nhiên</option>
              <option value="daily-activities">🏠 Hoạt động hàng ngày</option>
              <option value="travel">✈️ Du lịch</option>
            </select>
          </div>

          <div className="form-group">
            <label>Thumbnail:</label>
            
            {/* Upload Area */}
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                {uploading ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">📷</div>
                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <small>Hỗ trợ: JPG, PNG, GIF</small>
                  </div>
                )}
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                    setFormData({ ...formData, thumbnail: '' });
                  }}
                >
                  ✕ Xóa ảnh
                </button>
              </div>
            )}

            {/* URL Input */}
            <div className="url-input-group">
              <label htmlFor="thumbnail-url">Hoặc nhập URL ảnh:</label>
              <input
                id="thumbnail-url"
                type="url"
                value={formData.thumbnail}
                onChange={(e) => {
                  setFormData({ ...formData, thumbnail: e.target.value });
                  if (e.target.value) {
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-button cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="modal-button save"
              disabled={loading || uploading}
            >
              {loading ? 'Đang lưu...' : uploading ? 'Đang upload...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassageEditModal;