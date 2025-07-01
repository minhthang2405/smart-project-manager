import { createTransporter, sendMail, testEmailConnection } from './server/services/mail.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMailService() {
    console.log('🧪 Testing Mail Service...');
    
    try {
        // Test 1: Create transporter
        console.log('\n1️⃣ Testing transporter creation...');
        const transporter = createTransporter();
        console.log('✅ Transporter created successfully');
        
        // Test 2: Test connection
        console.log('\n2️⃣ Testing email connection...');
        const connectionTest = await testEmailConnection();
        if (connectionTest) {
            console.log('✅ Email connection successful');
        } else {
            console.log('❌ Email connection failed');
            return;
        }
        
        // Test 3: Send test email (to your own email)
        console.log('\n3️⃣ Testing email sending...');
        const testEmail = process.env.EMAIL; // Send to yourself for testing
        
        if (!testEmail) {
            console.log('❌ No EMAIL environment variable found');
            return;
        }
        
        const emailResult = await sendMail({
            to: testEmail,
            subject: '🧪 Test Email from Smart Project Manager',
            text: 'This is a test email to verify the mail service is working correctly.',
            html: `
                <h2>🧪 Test Email</h2>
                <p>This is a test email to verify the mail service is working correctly.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            `
        });
        
        console.log('✅ Email sent successfully');
        console.log('📧 Message ID:', emailResult.messageId);
        
    } catch (error) {
        console.error('❌ Mail service test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testMailService();
