const admin = require('firebase-admin');

// Make sure your serviceAccount.json is in the same directory
const serviceAccount = require('./serviceAccount.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'ngocnguyenluong89@gmail.com';
const ADMIN_UID = 'yKi363LR6iMU65eta2tZWm6q4K43';

async function testFirebaseConnection() {
  try {
    console.log('🔧 Testing Firebase connection...');
    
    // 1. Test Firestore connection
    const db = admin.firestore();
    const testRef = db.collection('test').doc('connection');
    await testRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    console.log('✅ Firestore connection successful');
    
    // 2. Test Auth connection
    const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    console.log('✅ Auth connection successful');
    console.log('👤 User found:', userRecord.uid);
    console.log('🔐 Current claims:', userRecord.customClaims);
    
    // 3. Test data retrieval
    const topicsRef = db.collection('topics');
    const topicsSnapshot = await topicsRef.get();
    console.log('📚 Topics in Firestore:', topicsSnapshot.size);
    
    const passagesRef = db.collection('passages');
    const passagesSnapshot = await passagesRef.get();
    console.log('📖 Passages in Firestore:', passagesSnapshot.size);
    
    // 4. Test admin permissions
    if (userRecord.customClaims?.admin === true) {
      console.log('✅ Admin claims are set correctly');
    } else {
      console.log('⚠️ Admin claims are NOT set');
      console.log('🔧 Setting admin claims...');
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('✅ Admin claims set successfully');
    }
    
    console.log('🎉 Firebase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    process.exit(1);
  }
}

testFirebaseConnection();
