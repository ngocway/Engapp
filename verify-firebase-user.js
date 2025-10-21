const admin = require('firebase-admin');

// Sử dụng service account đã có
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'ngocnguyenluong89@gmail.com';
const ADMIN_PASSWORD = 'Admin#123456';
const ADMIN_UID = 'yKi363LR6iMU65eta2tZWm6q4K43';

async function verifyAndCreateUser() {
  try {
    console.log('🔍 Đang kiểm tra tài khoản Firebase...');
    
    // Kiểm tra xem user có tồn tại không
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(ADMIN_UID);
      console.log('✅ Tài khoản đã tồn tại:', userRecord.email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('⚠️ Tài khoản chưa tồn tại, đang tạo mới...');
        
        // Tạo user mới
        userRecord = await admin.auth().createUser({
          uid: ADMIN_UID,
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Admin',
          emailVerified: true,
        });
        console.log('✅ Đã tạo tài khoản mới:', userRecord.email);
      } else {
        throw err;
      }
    }
    
    // Cập nhật password nếu cần
    try {
      await admin.auth().updateUser(ADMIN_UID, {
        password: ADMIN_PASSWORD,
        emailVerified: true,
      });
      console.log('✅ Đã cập nhật password cho tài khoản');
    } catch (err) {
      console.log('⚠️ Không thể cập nhật password:', err.message);
    }
    
    // Gán custom claim admin=true
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    console.log('✅ Đã gán quyền admin=true cho UID:', ADMIN_UID);
    
    // Revoke refresh tokens để buộc cập nhật
    await admin.auth().revokeRefreshTokens(ADMIN_UID);
    console.log('🔄 Đã revoke refresh tokens');
    
    // Kiểm tra claims
    const updatedUser = await admin.auth().getUser(ADMIN_UID);
    console.log('🔐 Claims hiện tại:', updatedUser.customClaims);
    
    console.log('🎉 Hoàn thành! Tài khoản admin đã sẵn sàng:');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('🆔 UID:', ADMIN_UID);
    console.log('👑 Quyền:', updatedUser.customClaims);
    
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

verifyAndCreateUser();
