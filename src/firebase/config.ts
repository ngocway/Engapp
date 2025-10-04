import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Cấu hình Firebase cho project engapp-fbf12
// 🔑 Config mới từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCYB1syQHNWplLKhPmW_fG4GUo6cp-vouk",
  authDomain: "engapp-fbf12.firebaseapp.com",
  projectId: "engapp-fbf12",
  storageBucket: "engapp-fbf12.firebasestorage.app",
  messagingSenderId: "146283949727",
  appId: "1:146283949727:web:9db96566c894babfeb3caa",
  measurementId: "G-JQZQJ9PS96"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các service
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
