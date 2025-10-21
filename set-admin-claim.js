const admin = require('firebase-admin');

// Thay thế đường dẫn này bằng đường dẫn đến serviceAccount.json của bạn
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_UID = 'yKi363LR6iMU65eta2tZWm6q4K43';

async function setAdminClaim() {
  try {
    // Gán custom claim admin=true cho UID
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    console.log('✅ Đã gán quyền admin=true cho UID:', ADMIN_UID);

    // Buộc refresh token để claim có hiệu lực ngay
    await admin.auth().revokeRefreshTokens(ADMIN_UID);
    console.log('🔄 Đã revoke refresh tokens để buộc cập nhật claim');

    console.log('🎉 Hoàn thành! Admin đã có quyền ghi vào Firestore');
    console.log('📝 Hãy đăng xuất và đăng nhập lại admin panel để token được cập nhật');
    
  } catch (err) {
    console.error('❌ Lỗi khi gán quyền admin:', err);
    process.exit(1);
  }
}

setAdminClaim();
