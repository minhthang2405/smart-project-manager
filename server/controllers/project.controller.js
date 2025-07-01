import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import ProjectInvitation from '../models/ProjectInvitation.js';
import * as mailService from '../services/mail.service.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

export const createProject = async (req, res) => {
    const { name, owner } = req.body;
    const project = await Project.create({ name, owner });
    await ProjectMember.create({ projectId: project.id, email: owner });
    res.json(project);
};

export const addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const { id } = req.params;

        // Kiểm tra email có hợp lệ không
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }

        // Kiểm tra dự án có tồn tại không
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ error: 'Dự án không tồn tại' });
        }

        // Kiểm tra thành viên đã tồn tại trong dự án chưa
        const existInProject = await ProjectMember.findOne({ where: { projectId: id, email } });
        if (existInProject) {
            return res.status(400).json({ error: 'Thành viên đã tồn tại trong dự án' });
        }

        // Kiểm tra đã có lời mời chưa
        const existingInvite = await ProjectInvitation.findOne({ 
            where: { 
                projectId: id, 
                email, 
                status: 'pending',
                expiresAt: { [Op.gt]: new Date() }
            } 
        });
        if (existingInvite) {
            return res.status(400).json({ error: 'Đã gửi lời mời cho người này rồi, vui lòng đợi phản hồi' });
        }

        // Tạo token mời và thời gian hết hạn (7 ngày)
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Tạo lời mời
        await ProjectInvitation.create({
            projectId: id,
            email,
            inviterEmail: project.owner,
            inviteToken,
            expiresAt
        });

        // Gửi email mời với production URL
        const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
        const emailTemplate = mailService.generateInviteEmailTemplate(
            project.name, 
            project.owner, 
            inviteToken,
            clientUrl
        );
        
        await mailService.sendMail({
            to: email,
            subject: `🚀 Lời mời tham gia dự án "${project.name}"`,
            text: `Bạn được mời tham gia dự án "${project.name}" bởi ${project.owner}. Vui lòng kiểm tra email để xem chi tiết.`,
            html: emailTemplate
        });

        res.json({ 
            message: 'Gửi lời mời thành công! Người được mời sẽ nhận được email để phản hồi.',
            inviteToken 
        });
        
    } catch (error) {
        console.error('Lỗi khi gửi lời mời:', error);
        res.status(500).json({ error: 'Lỗi hệ thống khi gửi lời mời' });
    }
};

export const getProjects = async (req, res) => {
    const { owner } = req.query;
    let where = {};
    if (owner) where.owner = owner;
    const projects = await Project.findAll({ where });
    const projectsWithMembers = await Promise.all(projects.map(async (p) => {
        const members = await ProjectMember.findAll({ where: { projectId: p.id } });
        return { ...p.toJSON(), members: members.map(m => m.email) };
    }));
    res.json(projectsWithMembers);
};

export const getProjectById = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const members = await ProjectMember.findAll({ where: { projectId: id } });
    res.json({ ...project.toJSON(), members: members.map(m => m.email) });
};

// Lấy danh sách dự án mà user đã tham gia (không phải chủ dự án)
export const getJoinedProjects = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('🔍 Getting joined projects for:', email);

        // Lấy tất cả dự án mà user là thành viên
        const memberProjects = await ProjectMember.findAll({
            where: { email },
            include: [{
                model: Project,
                as: 'project', // Cần thiết lập association
                attributes: ['id', 'name', 'owner', 'createdAt', 'updatedAt']
            }]
        });

        console.log('✅ Found member projects:', memberProjects.length);

        // Format response
        const projects = memberProjects.map(mp => ({
            id: mp.project.id,
            name: mp.project.name,
            owner: mp.project.owner,
            joinedAt: mp.createdAt,
            isOwner: mp.project.owner === email,
            role: mp.project.owner === email ? 'owner' : 'member'
        }));

        res.json(projects);
        
    } catch (error) {
        console.error('❌ Error getting joined projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy thống kê dự án cho user
export const getUserProjectStats = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Dự án sở hữu
        const ownedProjects = await Project.count({ where: { owner: email } });
        
        // Dự án tham gia
        const joinedProjects = await ProjectMember.count({ where: { email } });
        
        // Dự án tham gia nhưng không sở hữu
        const memberProjects = await ProjectMember.count({ 
            where: { email },
            include: [{
                model: Project,
                as: 'project',
                where: { owner: { [Op.ne]: email } }
            }]
        });

        res.json({
            owned: ownedProjects,
            joined: joinedProjects,
            asMember: memberProjects,
            total: joinedProjects
        });
        
    } catch (error) {
        console.error('❌ Error getting project stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
