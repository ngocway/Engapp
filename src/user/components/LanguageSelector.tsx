import React, { useState, useRef, useEffect } from 'react';
import { NativeLanguage } from '../../firebase/userSettingsService';
import './LanguageSelector.css';

interface LanguageOption {
  key: NativeLanguage;
  label: string;
  flag: string;
  flagAlt: string;
}

interface LanguageSelectorProps {
  selectedLanguage: NativeLanguage;
  onLanguageChange: (language: NativeLanguage) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: LanguageOption[] = [
    {
      key: 'vietnamese',
      label: 'Tiếng Việt',
      flag: 'https://assets.parroto.app/images/flags/vn.svg',
      flagAlt: 'Vietnamese flag'
    },
    {
      key: 'english',
      label: 'English',
      flag: 'https://assets.parroto.app/images/flags/gb.svg',
      flagAlt: 'British flag'
    },
    {
      key: 'thai',
      label: 'ไทย',
      flag: 'https://assets.parroto.app/images/flags/th.svg',
      flagAlt: 'Thai flag'
    }
  ];

  const selectedLang = languages.find(lang => lang.key === selectedLanguage) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (language: NativeLanguage) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <div className={`language-selector ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img 
          src={selectedLang.flag} 
          className="flag-icon" 
          alt={selectedLang.flagAlt}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="flag-emoji hidden">
          {selectedLang.key === 'vietnamese' ? '🇻🇳' : 
           selectedLang.key === 'english' ? '🇬🇧' : '🇹🇭'}
        </span>
        <span className="language-label">{selectedLang.label}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`chevron-icon ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-content">
            {languages.map((language) => (
              <button
                key={language.key}
                className={`language-option ${selectedLanguage === language.key ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(language.key)}
                type="button"
              >
                <img 
                  src={language.flag} 
                  className="flag-icon" 
                  alt={language.flagAlt}
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="flag-emoji hidden">
                  {language.key === 'vietnamese' ? '🇻🇳' : 
                   language.key === 'english' ? '🇬🇧' : '🇹🇭'}
                </span>
                <span className="language-label">{language.label}</span>
                {selectedLanguage === language.key && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="check-icon"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
