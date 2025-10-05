# 🎓 English Learning App - Vocabulary Management System

A comprehensive English learning application with AI-powered vocabulary management system built with React, TypeScript, and Firebase.

## ✨ Features

### 🎯 Core Features
- **Vocabulary Management**: Complete CRUD operations for vocabulary words
- **AI-Powered Pronunciation**: Automatic Vietnamese pronunciation suggestions
- **Multiple Examples**: Support for multiple example sentences per vocabulary word
- **Media Upload**: Image and audio upload with drag-and-drop functionality
- **Real-time Stats**: Live display of questions and vocabulary counts per passage
- **Modern UI**: Beautiful, responsive design with glass morphism effects

### 🤖 AI Features
- **Smart Pronunciation**: AI suggests Vietnamese pronunciation for English words
- **100+ Pre-built Pronunciations**: Database of common words with accurate pronunciations
- **Fallback Algorithm**: Automatic pronunciation generation for new words

### 🎨 UI/UX Features
- **Drag & Drop**: File upload with visual feedback
- **Loading States**: Progress indicators for uploads and AI processing
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark interface with beautiful gradients

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Styling**: Custom CSS with modern animations
- **Build Tool**: Create React App
- **Version Control**: Git

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AdminPanel.tsx
│   ├── AdminVocabularyPage.tsx
│   ├── PassageEditModal.tsx
│   └── ...
├── pages/               # Main application pages
│   ├── HomePage.tsx
│   ├── AdminPage.tsx
│   └── ...
├── firebase/            # Firebase services
│   ├── config.ts
│   ├── authService.ts
│   └── ...
├── services/            # External services
│   └── pronunciationService.ts
├── types/               # TypeScript interfaces
│   └── index.ts
└── data/                # Sample data
    └── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/eng-app-vocabulary.git
   cd eng-app-vocabulary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore, Storage, and Authentication
   - Update `src/firebase/config.ts` with your Firebase config

4. **Run the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable the following services:
   - **Firestore Database**
   - **Storage**
   - **Authentication**
3. Update `src/firebase/config.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 📚 Usage

### Admin Features
1. **Access Admin Panel**: Navigate to Admin section
2. **Manage Passages**: Create, edit, delete reading passages
3. **Manage Vocabulary**: Add vocabulary with images, audio, and examples
4. **AI Pronunciation**: Use AI to suggest Vietnamese pronunciations
5. **Upload Media**: Drag and drop images and audio files

### Student Features
1. **Browse Topics**: Select learning topics
2. **Read Passages**: Interactive reading experience
3. **Learn Vocabulary**: Study words with examples and pronunciations
4. **Practice Exercises**: Complete vocabulary and comprehension exercises

## 🤖 AI Pronunciation Service

The app includes a smart pronunciation service that:
- Provides 100+ pre-built Vietnamese pronunciations for common English words
- Uses AI algorithms to generate pronunciations for new words
- Supports easy editing and customization
- Ready for integration with external AI APIs (OpenAI, Claude, etc.)

## 📱 Screenshots

### Admin Panel
- Modern vocabulary management interface
- Drag-and-drop file upload
- AI pronunciation suggestions
- Multiple examples support

### Student Interface
- Beautiful passage reading experience
- Interactive vocabulary learning
- Progress tracking
- Responsive design

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Complete vocabulary management system
- ✅ AI-powered pronunciation suggestions
- ✅ Multiple examples support
- ✅ Image and audio upload
- ✅ Real-time stats display
- ✅ Modern UI with drag-drop functionality
- ✅ Firebase integration
- ✅ TypeScript support

### v1.0.0
- Basic passage reading functionality
- Simple vocabulary display

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Firebase for backend services
- React community for excellent documentation
- AI services for pronunciation assistance

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Wiki](https://github.com/YOUR_USERNAME/eng-app-vocabulary/wiki)

---

**⭐ Star this repository if you found it helpful!**