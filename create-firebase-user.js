const admin = require('firebase-admin');

// Sử dụng service account đã có
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'ngocnguyenluong89@gmail.com';
const ADMIN_PASSWORD = 'Admin#123456';
const ADMIN_UID = 'yKi363LR6iMU65eta2tZWm6q4K43';

async function createFirebaseUser() {
  try {
    console.log('🔄 Đang tạo tài khoản Firebase...');
    
    // Tạo user với UID cụ thể
    const userRecord = await admin.auth().createUser({
      uid: ADMIN_UID,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Admin',
      emailVerified: true,
    });
    
    console.log('✅ Đã tạo tài khoản Firebase:', userRecord.uid);
    
    // Gán custom claim admin=true
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    console.log('✅ Đã gán quyền admin=true cho UID:', ADMIN_UID);
    
    // Revoke refresh tokens để buộc cập nhật
    await admin.auth().revokeRefreshTokens(ADMIN_UID);
    console.log('🔄 Đã revoke refresh tokens');
    
    console.log('🎉 Hoàn thành! Tài khoản admin đã sẵn sàng:');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('🆔 UID:', ADMIN_UID);
    console.log('👑 Quyền: admin=true');
    
  } catch (err) {
    if (err.code === 'auth/uid-already-exists') {
      console.log('⚠️ Tài khoản đã tồn tại, đang cập nhật quyền...');
      
      // Gán custom claim admin=true
      await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
      console.log('✅ Đã gán quyền admin=true cho UID:', ADMIN_UID);
      
      // Revoke refresh tokens để buộc cập nhật
      await admin.auth().revokeRefreshTokens(ADMIN_UID);
      console.log('🔄 Đã revoke refresh tokens');
      
      console.log('🎉 Hoàn thành! Quyền admin đã được cập nhật');
    } else {
      console.error('❌ Lỗi khi tạo tài khoản:', err);
      process.exit(1);
    }
  }
}

createFirebaseUser();
