const admin = require('firebase-admin');
const serviceAccount = require('../imposter-game-e5f12-firebase-adminsdk-fbsvc-eccb71e756.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://imposter-game-e5f12-default-rtdb.firebaseio.com"
});

const database = admin.database();

const verifyPremiumEmails = async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 VERIFYING PREMIUM EMAILS IN FIREBASE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const ref = database.ref('config/premiumEmails');
        const snapshot = await ref.once('value');

        if (snapshot.exists()) {
            const val = snapshot.val();
            let emails = [];

            if (Array.isArray(val)) {
                emails = val;
            } else if (typeof val === 'object') {
                emails = Object.values(val);
            }

            console.log(`✅ Found ${emails.length} premium email(s):`);
            emails.forEach((email, index) => {
                console.log(`   ${index + 1}. ${email}`);
                if (email.toLowerCase() === 'raynusman100@gmail.com') {
                    console.log('      ✅ Target email CONFIRMED in list!');
                }
            });

            // Test case sensitivity
            const testEmail = 'raynusman100@gmail.com';
            const testEmailUpper = 'RAYNUSMAN100@GMAIL.COM';

            console.log('\n📋 Case Sensitivity Tests:');
            console.log(`   Lowercase check: ${emails.includes(testEmail.toLowerCase()) ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   Uppercase check (should still work): ${emails.map(e => e.toLowerCase()).includes(testEmailUpper.toLowerCase()) ? '✅ PASS' : '❌ FAIL'}`);

        } else {
            console.log('❌ No premium emails found in Firebase!');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
};

verifyPremiumEmails();
