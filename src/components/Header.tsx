import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserSettingsModal from './UserSettingsModal';
import LanguageSelector from './LanguageSelector';
import EnglishLevelSelector from './EnglishLevelSelector';
import UserDropdown from './UserDropdown';
import { userSettingsService, NativeLanguage, EnglishLevel } from '../firebase/userSettingsService';
import './Header.css';

type TabType = 'topics' | 'review';

interface HeaderProps {
  onTabChange: (tab: TabType) => void;
  activeTab: TabType;
}

const Header: React.FC<HeaderProps> = ({ onTabChange, activeTab }) => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<NativeLanguage>('vietnamese');
  const [currentLevel, setCurrentLevel] = useState<EnglishLevel>('basic');
  const [isScrolled, setIsScrolled] = useState(false);

  // Load user settings when component mounts or user changes
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          const settings = await userSettingsService.getUserSettings(user.uid);
          if (settings) {
            setCurrentLanguage(settings.nativeLanguage);
            setCurrentLevel(settings.englishLevel);
          }
        } catch (error) {
          console.error('Error loading user settings:', error);
        }
      }
    };

    loadUserSettings();
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = async (language: NativeLanguage) => {
    setCurrentLanguage(language);
    // Save to user settings if user is logged in
    if (user) {
      try {
        const currentSettings = await userSettingsService.getUserSettings(user.uid);
        if (currentSettings) {
          await userSettingsService.saveUserSettings(user.uid, {
            ...currentSettings,
            nativeLanguage: language
          });
        }
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
    
    // Auto reload page to update content with new language
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLevelChange = async (level: EnglishLevel) => {
    setCurrentLevel(level);
    // Save to user settings if user is logged in
    if (user) {
      try {
        const currentSettings = await userSettingsService.getUserSettings(user.uid);
        if (currentSettings) {
          await userSettingsService.saveUserSettings(user.uid, {
            ...currentSettings,
            englishLevel: level
          });
        }
      } catch (error) {
        console.error('Error saving English level:', error);
      }
    }
    
    // Auto reload page to update content with new level
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };


  return (
    <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo, tên app và navigation */}
        <div className="header-left">
          <div className="header-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <div className="logo-bird">🐦</div>
            </div>
            <span className="logo-text">EngApp</span>
          </div>

          {/* Navigation - sát bên tên app */}
          <nav className="header-nav">
            <button 
              className={`nav-button ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => onTabChange('topics')}
            >
              Chủ đề
            </button>
            <button 
              className={`nav-button ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => onTabChange('review')}
            >
              Ôn tập
            </button>
          </nav>
        </div>

        {/* Right section - English Level, Language, User */}
        <div className="header-right">
          {/* English Level Selector */}
          <EnglishLevelSelector
            selectedLevel={currentLevel}
            onLevelChange={handleLevelChange}
            className="header-level-selector"
          />

          {/* Language Selector */}
          <LanguageSelector
            selectedLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            className="header-language-selector"
          />

          {/* User section */}
          <div className="header-user">
            {user ? (
              <div className="user-info">
                <div 
                  className="user-avatar clickable-avatar"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  title="Click để mở menu"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}
                    </div>
                  )}
                </div>
                
                {/* User Dropdown */}
                <UserDropdown
                  isOpen={showUserDropdown}
                  onClose={() => setShowUserDropdown(false)}
                />
              </div>
            ) : (
              <button 
                className="login-button"
                onClick={login}
              >
                Bắt đầu
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
};

export default Header;
