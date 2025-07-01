import express from 'express';
import { googleLogin } from '../controllers/auth.controller.js';
import * as mailService from '../services/mail.service.js';

const router = express.Router();

// Test endpoint để kiểm tra email
router.post('/test-email', async (req, res) => {
    try {
        const { testEmail } = req.body;
        
        // Test kết nối
        const connectionTest = await mailService.testEmailConnection();
        if (!connectionTest) {
            return res.status(500).json({ error: 'Không thể kết nối tới email server' });
        }

        // Gửi email test
        await mailService.sendMail({
            to: testEmail || 'nahnahnah002@gmail.com',
            subject: '🧪 Test Email từ SmartPM',
            text: 'Đây là email test để kiểm tra kết nối.',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4f46e5;">🧪 Email Test Thành Công!</h2>
                    <p>Hệ thống email đã hoạt động bình thường.</p>
                    <p>Thời gian: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        res.json({ message: 'Gửi email test thành công!' });
    } catch (error) {
        console.error('Lỗi test email:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/google', googleLogin);

export default router;
