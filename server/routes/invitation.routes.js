import express from 'express';
import crypto from 'crypto';
import { handleInvitationResponse, getInvitationInfo, getProjectInvitations, completeProjectJoin } from '../controllers/invitation.controller.js';
import Project from '../models/Project.js';
import ProjectInvitation from '../models/ProjectInvitation.js';


const router = express.Router();

// Route xử lý phản hồi lời mời (accept/reject)
router.get('/respond', handleInvitationResponse);

// Route hoàn tất tham gia dự án sau khi đăng nhập
router.post('/complete-join', completeProjectJoin);

// Route lấy thông tin lời mời
router.get('/:token', getInvitationInfo);

// Route lấy danh sách lời mời của dự án
router.get('/project/:projectId', getProjectInvitations);

// Test endpoint để tạo invitation giả (chỉ dùng để test)
router.post('/create-test-invitation', async (req, res) => {
    try {
        const { projectName, inviterEmail, inviteeEmail } = req.body;
        
        // Import User model
        const User = (await import('../models/User.js')).default;
        
        // Tạo hoặc lấy user inviter
        let inviter = await User.findByPk(inviterEmail);
        if (!inviter) {
            inviter = await User.create({
                email: inviterEmail,
                name: 'Test Manager',
                avatar: 'https://via.placeholder.com/150'
            });
        }
        
        // Tạo hoặc lấy project test
        let project = await Project.findOne({ where: { name: projectName } });
        if (!project) {
            project = await Project.create({
                name: projectName,
                owner: inviterEmail
            });
        }

        // Tạo token mời và thời gian hết hạn (7 ngày)
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Tạo lời mời test
        const invitation = await ProjectInvitation.create({
            projectId: project.id,
            email: inviteeEmail,
            inviterEmail: inviterEmail,
            inviteToken,
            expiresAt
        });

        const testUrl = `http://localhost:5173/invitation?token=${inviteToken}&action=accept`;
        
        res.json({ 
            message: 'Tạo invitation test thành công!',
            inviteToken,
            testUrl,
            invitation
        });
        
    } catch (error) {
        console.error('Lỗi tạo invitation test:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
