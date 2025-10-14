import React, { useState, useEffect } from 'react';
import { userSettingsService, UserSettings, NativeLanguage, EnglishLevel } from '../firebase/userSettingsService';
import { settingsService, NativeLanguageOption, EnglishLevelOption } from '../firebase/settingsService';
import { useAuth } from '../contexts/AuthContext';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    nativeLanguage: 'vietnamese',
    englishLevel: 'basic',
    updatedAt: Date.now()
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Dynamic data from Firebase
  const [nativeLanguages, setNativeLanguages] = useState<NativeLanguageOption[]>([]);
  const [englishLevels, setEnglishLevels] = useState<EnglishLevelOption[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load settings data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettingsData();
      if (user) {
        loadUserSettings();
      }
    }
  }, [isOpen, user]);

  // Load settings options from Firebase
  const loadSettingsData = async () => {
    try {
      setSettingsLoading(true);
      
      // Initialize default settings if needed
      await settingsService.initializeDefaultSettings();
      
      // Load native languages and English levels
      const [languagesData, levelsData] = await Promise.all([
        settingsService.getNativeLanguages(),
        settingsService.getEnglishLevels()
      ]);
      
      setNativeLanguages(languagesData);
      setEnglishLevels(levelsData);
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadUserSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userSettings = await userSettingsService.getUserSettings(user.uid);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const success = await userSettingsService.saveUserSettings(user.uid, settings);
      if (success) {
        console.log('✅ User settings saved successfully');
        
        // Show success message
        alert('✅ Cài đặt đã được lưu! Trang sẽ được tải lại để áp dụng thay đổi.');
        
        onClose();
        
        // Reload page to apply new settings
        setTimeout(() => {
          console.log('🔄 Reloading page to apply new settings...');
          window.location.reload();
        }, 500); // Small delay to ensure modal closes first
      } else {
        console.error('❌ Failed to save user settings');
        alert('Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleNativeLanguageChange = (language: NativeLanguage) => {
    setSettings(prev => ({ ...prev, nativeLanguage: language }));
  };

  const handleEnglishLevelChange = (level: EnglishLevel) => {
    setSettings(prev => ({ ...prev, englishLevel: level }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Cài đặt cá nhân</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading || settingsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải cài đặt...</p>
            </div>
          ) : (
            <>
              {/* Native Language Selection */}
              <div className="settings-section">
                <h3>🌍 Ngôn ngữ mẹ đẻ</h3>
                <div className="settings-options">
                  {nativeLanguages.map((language) => (
                    <label 
                      key={language.id}
                      className={`option-card ${settings.nativeLanguage === language.key ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="nativeLanguage"
                        value={language.key}
                        checked={settings.nativeLanguage === language.key}
                        onChange={() => handleNativeLanguageChange(language.key as NativeLanguage)}
                      />
                      <div className="option-content">
                        <span className="option-icon">{language.icon}</span>
                        <span className="option-text">{language.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* English Level Selection */}
              <div className="settings-section">
                <h3>📚 Trình độ tiếng Anh</h3>
                <div className="settings-options">
                  {englishLevels.map((level) => (
                    <label 
                      key={level.id}
                      className={`option-card ${settings.englishLevel === level.key ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="englishLevel"
                        value={level.key}
                        checked={settings.englishLevel === level.key}
                        onChange={() => handleEnglishLevelChange(level.key as EnglishLevel)}
                      />
                      <div className="option-content">
                        <span className="option-icon">{level.icon}</span>
                        <span className="option-text">{level.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="button button-secondary" 
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button 
            className="button button-primary" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
