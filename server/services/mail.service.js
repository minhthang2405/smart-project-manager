import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const createTransporter = () => {
    if (!process.env.EMAIL || !process.env.PASSWORD) {
        throw new Error('❌ Thiếu cấu hình EMAIL hoặc PASSWORD trong file .env');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

export const sendMail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransporter();
        
        const info = await transporter.sendMail({
            from: `"SmartPM" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });
        
        return info;
    } catch (error) {
        console.error('❌ Lỗi gửi email:', error);
        throw error;
    }
};

export const generateInviteEmailTemplate = (projectName, inviterEmail, inviteToken, baseUrl = 'http://localhost:5173') => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lời mời tham gia dự án</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
            .btn-accept { background-color: #28a745; color: white; }
            .btn-reject { background-color: #dc3545; color: white; }
            .btn-accept:hover { background-color: #218838; }
            .btn-reject:hover { background-color: #c82333; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
            .project-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Lời mời tham gia dự án</h1>
                <p>Smart Project Management</p>
            </div>
            <div class="content">
                <h2>Xin chào!</h2>
                <p>Bạn được <strong>${inviterEmail}</strong> mời tham gia dự án:</p>
                
                <div class="project-info">
                    <h3>📋 ${projectName}</h3>
                    <p>Đây là một dự án quản lý thông minh với khả năng phân công công việc dựa trên kỹ năng cá nhân.</p>
                </div>

                <p>Vui lòng chọn một trong hai tùy chọn bên dưới:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/invitation?token=${inviteToken}&action=accept" class="button btn-accept">
                        ✅ Tham gia dự án
                    </a>
                    <a href="${baseUrl}/invitation?token=${inviteToken}&action=reject" class="button btn-reject">
                        ❌ Từ chối tham gia
                    </a>
                </div>

                <p><small>⏰ Lời mời này có hiệu lực trong vòng 7 ngày kể từ ngày gửi.</small></p>
            </div>
            <div class="footer">
                <p>© 2025 Smart Project Management</p>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('❌ Lỗi kết nối email:', error);
        return false;
    }
};
