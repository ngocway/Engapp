// Module Configuration
export const MODULE_CONFIG = {
  // Admin Module Configuration
  ADMIN: {
    enabled: true,
    routes: ['/admin'],
    components: [
      'AdminPage',
      'AdminLogin', 
      'AdminPanel',
      'AdminHeader',
      'AdminPassageManager',
      'AdminQuestionsPage',
      'AdminTopicsPage',
      'AdminVocabPage',
      'AdminVocabularyPage'
    ],
    services: [
      'adminAuthService'
    ],
    contexts: [
      'AdminContext'
    ]
  },
  
  // User Module Configuration  
  USER: {
    enabled: true,
    routes: ['/', '/topics', '/passage', '/my-vocab', '/review'],
    components: [
      'HomePage',
      'TopicDetailPage',
      'PassageDetail',
      'PassageList',
      'MyVocab',
      'ReviewPage',
      'Header',
      'MainLayout',
      'TopicsSection',
      'LessonCard',
      'LoginForm',
      'LoginRequiredModal'
    ],
    services: [
      'authService',
      'passageService',
      'vocabService',
      'settingsService'
    ],
    contexts: [
      'AuthContext'
    ]
  }
};

// Module Isolation Rules
export const ISOLATION_RULES = {
  // Admin cannot import from User
  ADMIN_CANNOT_IMPORT: [
    'src/user/**',
    'src/components/Header.tsx',
    'src/components/MainLayout.tsx',
    'src/components/TopicsSection.tsx',
    'src/components/LessonCard.tsx',
    'src/pages/HomePage.tsx',
    'src/pages/TopicDetailPage.tsx',
    'src/contexts/AuthContext.tsx'
  ],
  
  // User cannot import from Admin
  USER_CANNOT_IMPORT: [
    'src/admin/**',
    'src/components/AdminLogin.tsx',
    'src/components/AdminPanel.tsx',
    'src/components/AdminHeader.tsx',
    'src/pages/AdminPage.tsx',
    'src/contexts/AdminContext.tsx',
    'src/firebase/adminAuthService.ts'
  ],
  
  // Shared components that both can use
  SHARED_COMPONENTS: [
    'src/components/PassageEditModal.tsx',
    'src/components/VocabCard.tsx',
    'src/components/VocabularyCard.tsx',
    'src/components/QuizSection.tsx',
    'src/components/SentenceSection.tsx',
    'src/components/HighlightedText.tsx',
    'src/components/SearchAndFilter.tsx',
    'src/components/TopicTypeSelector.tsx',
    'src/components/EnglishLevelSelector.tsx',
    'src/components/LanguageSelector.tsx',
    'src/components/UserDropdown.tsx',
    'src/components/VocabFlashcard.tsx',
    'src/components/VocabManagementModal.tsx',
    'src/components/VocabPopup.tsx',
    'src/components/SettingsManager.tsx',
    'src/components/UserSettingsModal.tsx',
    'src/components/SimpleHeader.tsx',
    'src/components/TestHtmlConversion.tsx',
    'src/components/UpdatePassagesButton.tsx',
    'src/components/MiniVocabCard.tsx',
    'src/components/MyVocab.tsx',
    'src/components/SentenceExercise.tsx'
  ]
};

export default MODULE_CONFIG;


