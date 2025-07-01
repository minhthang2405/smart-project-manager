import ProjectInvitation from '../models/ProjectInvitation.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import * as mailService from '../services/mail.service.js';
import { Op } from 'sequelize';

// Xử lý phản hồi lời mời (tham gia hoặc từ chối)
export const handleInvitationResponse = async (req, res) => {
    try {
        const { token, action } = req.query;

        console.log('🔍 Invitation Response:', { token, action });

        if (!token || !action) {
            return res.status(400).json({ error: 'Thiếu thông tin lời mời' });
        }

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Hành động không hợp lệ' });
        }

        // Tìm lời mời - bỏ include project để tránh lỗi association
        const invitation = await ProjectInvitation.findOne({
            where: {
                inviteToken: token,
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        console.log('🔍 Found invitation:', invitation?.id, invitation?.status);

        if (!invitation) {
            // Kiểm tra xem có invitation nào với token này không (kể cả đã expired)
            const anyInvitation = await ProjectInvitation.findOne({
                where: { inviteToken: token }
            });
            
            if (anyInvitation) {
                console.log('❌ Invitation expired or not pending:', anyInvitation.status, anyInvitation.expiresAt);
                return res.status(404).json({ 
                    error: anyInvitation.expiresAt < new Date() ? 'Lời mời đã hết hạn' : 'Lời mời đã được xử lý rồi',
                    expired: true 
                });
            } else {
                console.log('❌ No invitation found with token:', token);
                return res.status(404).json({ 
                    error: 'Lời mời không tồn tại',
                    expired: true 
                });
            }
        }

        const project = await Project.findByPk(invitation.projectId);
        
        if (action === 'accept') {
            // Chấp nhận lời mời - chỉ cập nhật trạng thái, không tạo user hay thêm vào project ngay
            invitation.status = 'accepted';
            await invitation.save();

            const project = await Project.findByPk(invitation.projectId);

            // Gửi thông báo cho chủ dự án
            try {
                await mailService.sendMail({
                    to: invitation.inviterEmail,
                    subject: `✅ ${invitation.email} đã chấp nhận lời mời dự án "${project.name}"`,
                    text: `Tin vui! ${invitation.email} đã chấp nhận lời mời tham gia dự án "${project.name}". Họ sẽ hoàn tất việc đăng ký và cập nhật kỹ năng để tham gia dự án.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #28a745;">✅ Lời mời được chấp nhận!</h2>
                                <p>Tin vui! <strong>${invitation.email}</strong> đã chấp nhận lời mời tham gia dự án:</p>
                                <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <h3>📋 ${project.name}</h3>
                                </div>
                                <p>Thành viên mới sẽ hoàn tất việc đăng ký và cập nhật kỹ năng để có thể nhận công việc.</p>
                                <p style="color: #666; font-size: 14px;">© 2025 Smart Project Management</p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Lỗi gửi email thông báo:', emailError);
            }

            // Trả về thông tin để redirect đến trang đăng nhập
            res.json({
                success: true,
                action: 'accept',
                message: 'Chấp nhận lời mời thành công!',
                projectName: project.name,
                email: invitation.email,
                inviteToken: token,
                needsLogin: true,
                redirectTo: 'login'
            });

        } else if (action === 'reject') {
            // Từ chối lời mời
            invitation.status = 'rejected';
            await invitation.save();

            // Gửi thông báo cho chủ dự án
            try {
                await mailService.sendMail({
                    to: invitation.inviterEmail,
                    subject: `❌ ${invitation.email} đã từ chối tham gia dự án "${project.name}"`,
                    text: `${invitation.email} đã từ chối lời mời tham gia dự án "${project.name}".`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #dc3545;">❌ Lời mời bị từ chối</h2>
                                <p><strong>${invitation.email}</strong> đã từ chối lời mời tham gia dự án:</p>
                                <div style="background: #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <h3>📋 ${project.name}</h3>
                                </div>
                                <p>Bạn có thể mời người khác hoặc thử lại sau.</p>
                                <p style="color: #666; font-size: 14px;">© 2025 Smart Project Management</p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Lỗi gửi email thông báo:', emailError);
            }

            res.json({
                success: true,
                message: 'Từ chối lời mời thành công!',
                projectName: project.name
            });
        }

    } catch (error) {
        console.error('Lỗi xử lý phản hồi lời mời:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};

// Lấy thông tin lời mời để hiển thị trang xác nhận
export const getInvitationInfo = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await ProjectInvitation.findOne({
            where: {
                inviteToken: token,
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!invitation) {
            return res.status(404).json({ 
                error: 'Lời mời không tồn tại hoặc đã hết hạn' 
            });
        }

        const project = await Project.findByPk(invitation.projectId);

        res.json({
            email: invitation.email,
            projectName: project.name,
            inviterEmail: invitation.inviterEmail,
            expiresAt: invitation.expiresAt
        });

    } catch (error) {
        console.error('Lỗi lấy thông tin lời mời:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};

// Lấy danh sách lời mời của dự án (cho chủ dự án)
export const getProjectInvitations = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const invitations = await ProjectInvitation.findAll({
            where: { projectId },
            order: [['createdAt', 'DESC']]
        });

        res.json(invitations);
    } catch (error) {
        console.error('Lỗi lấy danh sách lời mời:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};

// Hoàn tất tham gia dự án sau khi người dùng đã đăng nhập
export const completeProjectJoin = async (req, res) => {
    try {
        const { token, email } = req.body;

        console.log('🔗 Complete project join request:', { 
            token: token?.slice(0, 8) + '...', 
            email,
            timestamp: new Date().toISOString()
        });

        if (!token || !email) {
            console.log('❌ Missing required fields:', { token: !!token, email: !!email });
            return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
        }

        // Tìm invitation chỉ bằng token (không cần email match)
        console.log('🔍 Looking for invitation by token...');
        const invitation = await ProjectInvitation.findOne({
            where: {
                inviteToken: token
                // Không cần email filter vì user có thể login bằng email khác
            }
        });

        console.log('🔍 Found invitation:', invitation ? {
            id: invitation.id,
            status: invitation.status,
            originalEmail: invitation.email, // Email từ invitation
            actualEmail: email, // Email user thực tế login
            projectId: invitation.projectId,
            expiresAt: invitation.expiresAt
        } : 'None');

        if (!invitation) {
            console.log('❌ No invitation found');
            return res.status(404).json({ error: 'Không tìm thấy lời mời hợp lệ' });
        }

        // Kiểm tra expiry
        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            console.log('❌ Invitation expired:', invitation.expiresAt);
            return res.status(400).json({ error: 'Lời mời đã hết hạn' });
        }

        // Chấp nhận invitation nếu chưa được chấp nhận
        if (invitation.status === 'pending') {
            console.log('⚠️ Invitation still pending, accepting it now...');
            invitation.status = 'accepted';
            await invitation.save();
        } else if (invitation.status !== 'accepted') {
            console.log('❌ Invalid invitation status:', invitation.status);
            return res.status(400).json({ 
                error: `Lời mời không ở trạng thái hợp lệ (${invitation.status})` 
            });
        }

        // Kiểm tra user
        console.log('👤 Checking user exists...');
        const user = await User.findByPk(email);
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(404).json({ error: 'Người dùng chưa đăng ký' });
        }
        console.log('✅ User found:', { email: user.email, name: user.name });

        // Kiểm tra project
        console.log('📋 Checking project exists...');
        const project = await Project.findByPk(invitation.projectId);
        if (!project) {
            console.log('❌ Project not found:', invitation.projectId);
            return res.status(404).json({ error: 'Dự án không tồn tại' });
        }
        console.log('✅ Project found:', { id: project.id, name: project.name });

        // Thêm vào dự án nếu chưa có
        console.log('🔍 Checking existing membership...');
        const existingMember = await ProjectMember.findOne({
            where: { projectId: invitation.projectId, email: email }
        });

        if (!existingMember) {
            console.log('➕ Adding user to project...');
            const newMember = await ProjectMember.create({
                projectId: invitation.projectId,
                email: email
            });
            console.log('✅ Member added:', { id: newMember.id, projectId: newMember.projectId, email: newMember.email });
        } else {
            console.log('ℹ️ User already member of project:', { id: existingMember.id });
        }

        // Cập nhật trạng thái invitation thành accepted
        console.log('🔄 Updating invitation status to accepted...');
        invitation.status = 'accepted';
        await invitation.save();
        console.log('✅ Invitation status updated');

        // Gửi thông báo cuối cho chủ dự án với email thực của user
        console.log('📧 Sending completion notification...');
        console.log(`📧 Original invitation sent to: ${invitation.email}`);
        console.log(`📧 Actual user joined with: ${email}`);
        
        try {
            await mailService.sendMail({
                to: invitation.inviterEmail,
                subject: `🎉 ${email} đã hoàn tất tham gia dự án "${project.name}"`,
                text: `${email} đã hoàn tất việc đăng ký và tham gia dự án "${project.name}". Bạn có thể bắt đầu giao công việc cho họ.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                            <h2 style="color: #28a745;">🎉 Thành viên mới đã sẵn sàng!</h2>
                            <p><strong>${email}</strong> đã hoàn tất việc tham gia dự án:</p>
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3>📋 ${project.name}</h3>
                            </div>
                            ${invitation.email !== email ? 
                                `<p><small>💡 Lưu ý: Lời mời được gửi tới <strong>${invitation.email}</strong> nhưng thành viên đã tham gia bằng email <strong>${email}</strong></small></p>` 
                                : ''
                            }
                            <p>Bạn có thể bắt đầu giao công việc và sử dụng tính năng phân công thông minh.</p>
                            <p style="color: #666; font-size: 14px;">© 2025 Smart Project Management</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('❌ Email notification failed:', emailError);
        }

        console.log('✅ Project join completed successfully for:', email);

        res.json({
            success: true,
            message: 'Tham gia dự án thành công!',
            projectName: project.name,
            email: email
        });

    } catch (error) {
        console.error('❌ Lỗi hoàn tất tham gia dự án:', error);
        res.status(500).json({ error: 'Lỗi hệ thống: ' + error.message });
    }
};
