import React, { useState, useRef, useEffect } from 'react';
import { EnglishLevel } from '../../firebase/userSettingsService';
import './EnglishLevelSelector.css';

interface LevelOption {
  key: EnglishLevel;
  label: string;
  color: string;
}

interface EnglishLevelSelectorProps {
  selectedLevel: EnglishLevel;
  onLevelChange: (level: EnglishLevel) => void;
  className?: string;
}

const levelOptions: LevelOption[] = [
  {
    key: 'kids-2-4',
    label: 'Kids (2-4)',
    color: '#ff6b6b'
  },
  {
    key: 'kids-5-10',
    label: 'Kids (5-10)',
    color: '#4ecdc4'
  },
  {
    key: 'basic',
    label: 'Basic',
    color: '#45b7d1'
  },
  {
    key: 'independent',
    label: 'Independent',
    color: '#96ceb4'
  },
  {
    key: 'proficient',
    label: 'Proficient',
    color: '#feca57'
  }
];

const EnglishLevelSelector: React.FC<EnglishLevelSelectorProps> = ({
  selectedLevel,
  onLevelChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLevel = levelOptions.find(
    (level) => level.key === selectedLevel
  ) || levelOptions[2]; // Default to basic

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (level: EnglishLevel) => {
    onLevelChange(level);
    setIsOpen(false);
  };

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const options = dropdownRef.current?.querySelectorAll('.level-selector-option');
      if (!options || options.length === 0) return;

      const currentIndex = Array.from(options).findIndex(
        (option) => option === document.activeElement
      );

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        (options[nextIndex] as HTMLElement).focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        (options[prevIndex] as HTMLElement).focus();
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        (dropdownRef.current?.querySelector('.level-selector-trigger') as HTMLElement)?.focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement && document.activeElement.classList.contains('level-selector-option')) {
          (document.activeElement as HTMLElement).click();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`level-selector ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        className="level-selector-trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div 
          className="level-indicator" 
          style={{ backgroundColor: currentLevel.color }}
        ></div>
        <span className="level-label">{currentLevel.label}</span>
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
        <ul className="level-selector-options" role="listbox">
          {levelOptions.map((level) => (
            <li
              key={level.key}
              className={`level-selector-option ${selectedLevel === level.key ? 'selected' : ''}`}
              onClick={() => handleSelect(level.key)}
              role="option"
              aria-selected={selectedLevel === level.key}
              tabIndex={0}
            >
              <div 
                className="level-indicator" 
                style={{ backgroundColor: level.color }}
              ></div>
              <span className="level-label">{level.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnglishLevelSelector;
