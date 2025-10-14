import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserDropdown.css';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleProfileClick = () => {
    onClose();
    // Navigate to profile page or open profile modal
    console.log('Navigate to profile');
  };


  const handleLogoutClick = () => {
    onClose();
    logout();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <div className="p-2">
        {/* Profile Link */}
        <button 
          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md" 
          onClick={handleProfileClick}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round h-4 w-4">
              <path d="M18 20a6 6 0 0 0-12 0"></path>
              <circle cx="12" cy="10" r="4"></circle>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>Hồ sơ</span>
          </div>
        </button>


        {/* My Vocabulary Link */}
        <button 
          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md" 
          onClick={() => console.log('Navigate to my vocabulary')}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-whole-word h-4 w-4">
              <circle cx="7" cy="12" r="3"></circle>
              <path d="M10 9v6"></path>
              <circle cx="17" cy="12" r="3"></circle>
              <path d="M14 7v8"></path>
              <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"></path>
            </svg>
            <span>Từ vựng của tôi</span>
          </div>
        </button>

        {/* Logout Button */}
        <button 
          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted rounded-md"
          onClick={handleLogoutClick}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out h-4 w-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            <span>Đăng xuất</span>
          </div>
        </button>
      </div>
      
    </div>
  );
};

export default UserDropdown;
