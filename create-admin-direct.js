const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccount.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'admin@engapp.dev';
const ADMIN_PASSWORD = 'Admin123456!';

async function createAdminDirect() {
  try {
    console.log('🔧 Creating admin user directly in Firebase Auth...');
    
    // 1. Tạo user mới với email/password đơn giản
    const userRecord = await admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Admin',
      emailVerified: true,
    });
    
    console.log('✅ Created admin user:', userRecord.uid);
    
    // 2. Set admin claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Set admin claims');
    
    // 3. Revoke refresh tokens
    await admin.auth().revokeRefreshTokens(userRecord.uid);
    console.log('✅ Revoked refresh tokens');
    
    // 4. Kiểm tra claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('🔐 Final claims:', updatedUser.customClaims);
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('🆔 UID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminDirect();
