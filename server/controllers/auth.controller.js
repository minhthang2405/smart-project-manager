import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

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
