const admin = require('firebase-admin');

// Make sure your serviceAccount.json is in the same directory
const serviceAccount = require('./serviceAccount.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'ngocnguyenluong89@gmail.com';
const ADMIN_UID = 'yKi363LR6iMU65eta2tZWm6q4K43';

async function setAdminPermissions() {
  try {
    console.log('🔧 Đang cấu hình quyền admin...');
    
    // 1. Kiểm tra user có tồn tại không
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('✅ Tài khoản admin đã tồn tại:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('⚠️ Tài khoản admin chưa tồn tại, đang tạo mới...');
        userRecord = await admin.auth().createUser({
          uid: ADMIN_UID,
          email: ADMIN_EMAIL,
          password: 'Admin#123456',
          displayName: 'Admin',
          emailVerified: true,
        });
        console.log('✅ Đã tạo tài khoản admin mới:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // 2. Set custom claim admin=true
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Đã gán quyền admin=true cho UID:', userRecord.uid);

    // 3. Revoke refresh tokens để buộc user đăng nhập lại
    await admin.auth().revokeRefreshTokens(userRecord.uid);
    console.log('🔄 Đã revoke refresh tokens');

    // 4. Kiểm tra claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('🔐 Claims hiện tại:', updatedUser.customClaims);

    // 5. Tạo dữ liệu mẫu trong Firestore
    console.log('📝 Đang tạo dữ liệu mẫu trong Firestore...');
    
    const db = admin.firestore();
    
    // Tạo topics mẫu
    const topicsRef = db.collection('topics');
    await topicsRef.doc('sample-topic-1').set({
      title: 'Sample Topic 1',
      slug: 'sample-topic-1',
      description: 'Sample topic for admin panel',
      level: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Đã tạo topic mẫu');

    // Tạo passages mẫu
    const passagesRef = db.collection('passages');
    await passagesRef.doc('sample-passage-1').set({
      title: 'Sample Lesson 1',
      text: 'This is a sample lesson for admin panel.',
      level: 1,
      topicId: 'sample-topic-1',
      topicSlug: 'sample-topic-1',
      englishLevel: 'basic',
      accessType: 'free',
      vocab: [],
      questions: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await passagesRef.doc('sample-passage-2').set({
      title: 'Sample Lesson 2',
      text: 'This is another sample lesson for admin panel.',
      level: 2,
      topicId: 'sample-topic-1',
      topicSlug: 'sample-topic-1',
      englishLevel: 'independent',
      accessType: 'premium',
      vocab: [],
      questions: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Đã tạo passages mẫu');

    console.log('🎉 Hoàn thành! Cấu hình admin đã sẵn sàng:');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password: Admin#123456');
    console.log('🆔 UID:', ADMIN_UID);
    console.log('👑 Quyền:', updatedUser.customClaims);
    console.log('📝 Dữ liệu mẫu đã được tạo trong Firestore');
    console.log('🔄 Hãy đăng xuất và đăng nhập lại admin panel để token được cập nhật');

  } catch (error) {
    console.error('❌ Lỗi khi cấu hình quyền admin:', error);
    process.exit(1);
  }
}

setAdminPermissions();
