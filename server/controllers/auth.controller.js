import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendMail } from '../services/mail.service.js';

const client = new OAuth2Client();

export const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        let user = await User.findByPk(email);
        if (!user) {
            user = await User.create({
                email,
                name,
                avatar: picture,
                frontend: 0,
                backend: 0,
                ai: 0,
                devops: 0,
                mobile: 0,
                uxui: 0,
                testing: 0,
                management: 0,
            });
        }
        res.json({ user });
    } catch (err) {
        console.error('❌ Xác thực Google thất bại:', err);
        res.status(401).json({ error: 'Google Auth Failed' });
    }
};

export const sendInvite = async (req, res) => {
    const { memberEmail, projectName, leaderEmail } = req.body;
    try {
        await sendMail({
            to: memberEmail,
            subject: `🚀 Bạn được mời vào dự án "${projectName}"`,
            text: `Xin chào,\n\nBạn được thêm vào dự án "${projectName}" bởi ${leaderEmail}.\nTruy cập hệ thống để làm việc.\n\nSmartPM.`,
        });
        res.status(200).json({ message: 'Gửi email thành công!' });
    } catch (err) {
        console.error('❌ Gửi email lỗi:', err);
        res.status(500).json({ error: 'Không gửi được email' });
    }
};
