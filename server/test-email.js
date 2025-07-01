// Test email service để đảm bảo email được gửi khi tạo task
import * as mailService from './services/mail.service.js';

async function testEmailService() {
  try {
    console.log('📧 Testing email service...');
    
    const testEmail = 'thanglx19021@gmail.com';
    
    // Test basic email sending
    await mailService.sendMail({
      to: testEmail,
      subject: '🧪 Test Email từ SmartPM',
      text: 'Đây là email test từ hệ thống Smart Project Management.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #4f46e5;">🧪 Email Test</h2>
            <p>Đây là email test từ hệ thống Smart Project Management.</p>
            <p>Nếu bạn nhận được email này, nghĩa là hệ thống email đang hoạt động tốt!</p>
            <p style="color: #666; font-size: 14px;">© 2025 Smart Project Management</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📫 Vui lòng kiểm tra email:', testEmail);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmailService();
