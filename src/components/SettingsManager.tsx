import React, { useState, useEffect } from 'react';
import { settingsService, EnglishLevelOption, NativeLanguageOption } from '../firebase/settingsService';

interface SettingsManagerProps {
  onClose: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'english-levels' | 'native-languages'>('english-levels');
  const [englishLevels, setEnglishLevels] = useState<EnglishLevelOption[]>([]);
  const [nativeLanguages, setNativeLanguages] = useState<NativeLanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState<EnglishLevelOption | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<NativeLanguageOption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await settingsService.initializeDefaultSettings();
      
      const [levelsData, languagesData] = await Promise.all([
        settingsService.getEnglishLevels(),
        settingsService.getNativeLanguages()
      ]);
      
      setEnglishLevels(levelsData);
      setNativeLanguages(languagesData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLevel = (level: EnglishLevelOption) => {
    setEditingLevel(level);
    setShowAddForm(true);
  };

  const handleEditLanguage = (language: NativeLanguageOption) => {
    setEditingLanguage(language);
    setShowAddForm(true);
  };

  const handleDeleteLevel = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa level này?')) {
      const success = await settingsService.deleteEnglishLevel(id);
      if (success) {
        await loadSettings();
        alert('Đã xóa thành công!');
      } else {
        alert('Lỗi khi xóa!');
      }
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ngôn ngữ này?')) {
      const success = await settingsService.deleteNativeLanguage(id);
      if (success) {
        await loadSettings();
        alert('Đã xóa thành công!');
      } else {
        alert('Lỗi khi xóa!');
      }
    }
  };

  if (loading) {
    return (
      <div className="settings-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-manager">
      <div className="settings-header">
        <h2>Quản lý cài đặt hệ thống</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'english-levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('english-levels')}
        >
          📚 English Levels
        </button>
        <button 
          className={`tab-button ${activeTab === 'native-languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('native-languages')}
        >
          🌍 Native Languages
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'english-levels' && (
          <div className="levels-section">
            <div className="section-header">
              <h3>English Levels</h3>
              <button 
                className="add-button"
                onClick={() => {
                  setEditingLevel(null);
                  setShowAddForm(true);
                }}
              >
                + Thêm Level
              </button>
            </div>
            
            <div className="items-list">
              {englishLevels.map((level) => (
                <div key={level.id} className="item-card">
                  <div className="item-info">
                    <span className="item-icon" style={{ color: level.color }}>{level.icon}</span>
                    <div className="item-details">
                      <h4>{level.label}</h4>
                      <p>Key: {level.key}</p>
                      <p>Order: {level.order}</p>
                      <p>Status: {level.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditLevel(level)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteLevel(level.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'native-languages' && (
          <div className="languages-section">
            <div className="section-header">
              <h3>Native Languages</h3>
              <button 
                className="add-button"
                onClick={() => {
                  setEditingLanguage(null);
                  setShowAddForm(true);
                }}
              >
                + Thêm Ngôn ngữ
              </button>
            </div>
            
            <div className="items-list">
              {nativeLanguages.map((language) => (
                <div key={language.id} className="item-card">
                  <div className="item-info">
                    <span className="item-icon">{language.icon}</span>
                    <div className="item-details">
                      <h4>{language.label}</h4>
                      <p>Key: {language.key}</p>
                      <p>Order: {language.order}</p>
                      <p>Status: {language.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditLanguage(language)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteLanguage(language.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManager;
