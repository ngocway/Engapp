# EngApp Architecture

## Module Separation Strategy

This project uses a strict module separation strategy to ensure that User and Admin functionality are completely isolated.

### Directory Structure

```
src/
├── admin/                    # Admin-only code
│   ├── components/           # Admin components
│   ├── pages/               # Admin pages
│   ├── services/            # Admin services
│   ├── contexts/            # Admin contexts
│   ├── types/               # Admin types
│   ├── AdminApp.tsx         # Admin app router
│   └── index.tsx            # Admin exports
├── user/                    # User-only code
│   ├── components/          # User components
│   ├── pages/               # User pages
│   ├── services/            # User services
│   ├── contexts/            # User contexts
│   ├── types/               # User types
│   ├── UserApp.tsx          # User app router
│   └── index.tsx            # User exports
├── components/              # Shared components
├── firebase/                # Shared Firebase services
├── services/                # Shared services
├── data/                    # Shared data
├── types/                   # Shared types
└── config/                  # Configuration
```

### Isolation Rules

#### Admin Module
- **CANNOT** import from `src/user/**`
- **CANNOT** import from user-specific components
- **CAN ONLY** import from:
  - `src/admin/**` (own module)
  - `src/components/**` (shared components)
  - `src/firebase/**` (shared services)
  - `src/services/**` (shared services)
  - `src/types/**` (shared types)

#### User Module
- **CANNOT** import from `src/admin/**`
- **CANNOT** import from admin-specific components
- **CAN ONLY** import from:
  - `src/user/**` (own module)
  - `src/components/**` (shared components)
  - `src/firebase/**` (shared services)
  - `src/services/**` (shared services)
  - `src/types/**` (shared types)

### Benefits

1. **Complete Isolation**: Admin and User code cannot interfere with each other
2. **Independent Development**: Teams can work on admin and user features separately
3. **Easier Maintenance**: Changes to admin don't affect user functionality and vice versa
4. **Better Testing**: Each module can be tested independently
5. **Clearer Dependencies**: Easy to see what each module depends on

### Shared Components

The following components are shared between both modules:
- PassageEditModal
- VocabCard
- VocabularyCard
- QuizSection
- SentenceSection
- HighlightedText
- SearchAndFilter
- TopicTypeSelector
- EnglishLevelSelector
- LanguageSelector
- UserDropdown
- VocabFlashcard
- VocabManagementModal
- VocabPopup
- SettingsManager
- UserSettingsModal
- SimpleHeader
- TestHtmlConversion
- UpdatePassagesButton
- MiniVocabCard
- MyVocab
- SentenceExercise

### Firebase Services

Firebase services are shared but can be used differently:
- `authService.ts` - Used by User module
- `adminAuthService.ts` - Used by Admin module
- `passageService.ts` - Used by both modules
- `vocabService.ts` - Used by both modules
- `settingsService.ts` - Used by both modules

### Routing

- **User Routes**: `/`, `/topics`, `/passage`, `/my-vocab`, `/review`
- **Admin Routes**: `/admin`, `/admin/questions`, `/admin/vocabulary`

### Development Guidelines

1. **Never** import across module boundaries
2. **Always** use shared components for common functionality
3. **Keep** module-specific logic within the module
4. **Test** each module independently
5. **Document** any new shared components


