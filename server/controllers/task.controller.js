import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import * as mailService from '../services/mail.service.js';

export const createTask = async (req, res) => {
    try {
        const { title, difficulty, estimatedTime, assignee, deadline } = req.body;
        const { id } = req.params;
        
        console.log('📝 Creating task:', { title, difficulty, estimatedTime, assignee, projectId: id, deadline });
        
        // Validation
        if (!title) {
            console.log('❌ Missing task title');
            return res.status(400).json({ error: 'Tên công việc không được để trống' });
        }
        
        if (!difficulty) {
            console.log('❌ Missing difficulty');
            return res.status(400).json({ error: 'Vui lòng chọn độ khó' });
        }
        
        if (!estimatedTime) {
            console.log('❌ Missing estimated time');
            return res.status(400).json({ error: 'Vui lòng nhập thời gian dự kiến' });
        }
        
        if (!assignee) {
            console.log('❌ Missing assignee');
            return res.status(400).json({ error: 'Vui lòng chọn người nhận task' });
        }
        
        if (!id) {
            console.log('❌ Missing project ID');
            return res.status(400).json({ error: 'Thiếu thông tin dự án' });
        }
        
        // Kiểm tra project tồn tại
        const project = await Project.findByPk(id);
        if (!project) {
            console.log('❌ Project not found:', id);
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Kiểm tra assignee có trong project không
        const membership = await ProjectMember.findOne({
            where: { projectId: id, email: assignee }
        });
        
        if (!membership) {
            console.log('❌ Assignee not in project:', assignee);
            return res.status(400).json({ error: 'Assignee is not a member of this project' });
        }
        
        // Tạo task
        const task = await Task.create({ 
            title, 
            difficulty, 
            estimatedTime, 
            assignee, 
            projectId: id, 
            deadline: deadline ? new Date(deadline) : null
        });
        
        console.log('✅ Task created successfully:', task.id);
        
        // Gửi email thông báo (không block response)
        try {
            console.log('📧 Sending task notification email to:', assignee);
            
            const emailTemplate = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">📝 Bạn được giao nhiệm vụ mới!</h2>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">📋 ${title}</h3>
                            <div style="margin: 15px 0;">
                                <strong>🎯 Dự án:</strong> ${project.name}<br>
                                <strong>⚡ Độ khó:</strong> ${difficulty}<br>
                                <strong>⏱️ Thời gian dự kiến:</strong> ${estimatedTime}<br>
                                ${deadline ? `<strong>📅 Deadline:</strong> ${new Date(deadline).toLocaleDateString('vi-VN')}<br>` : ''}
                            </div>
                        </div>
                        <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và cập nhật tiến độ.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                🚀 Truy cập hệ thống
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px; text-align: center;">© 2025 Smart Project Management</p>
                    </div>
                </div>
            `;
            
            await mailService.sendMail({
                to: assignee,
                subject: `📝 Nhiệm vụ mới: "${title}" trong dự án "${project.name}"`,
                text: `Bạn vừa được giao task "${title}" trong dự án "${project.name}". Độ khó: ${difficulty}, thời gian dự kiến: ${estimatedTime}. Vui lòng đăng nhập để xem chi tiết!`,
                html: emailTemplate
            });
            
            console.log('✅ Task notification email sent successfully to:', assignee);
            
        } catch (emailErr) {
            console.error('❌ Gửi email task lỗi:', emailErr);
            // Không return error vì task đã tạo thành công
        }
        
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
        
    } catch (error) {
        console.error('❌ Error creating task:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getTasksByEmail = async (req, res) => {
    const { email } = req.query;
    const tasks = await Task.findAll({ where: { assignee: email } });
    res.json(tasks);
};

export const getAssignedTasks = async (req, res) => {
    try {
        const { owner } = req.query;
        if (!owner) {
            return res.status(400).json({ error: 'Thiếu owner' });
        }

        console.log('📋 Getting assigned tasks for owner:', owner);

        // Lấy tất cả project của owner
        const projects = await Project.findAll({ where: { owner } });
        const projectIds = projects.map(p => p.id);

        if (projectIds.length === 0) {
            return res.json([]);
        }

        // Tạo map project ID -> project name để tra cứu nhanh
        const projectMap = {};
        projects.forEach(project => {
            projectMap[project.id] = project.name;
        });

        // Lấy tasks từ các project này (không dùng include vì associations chưa load)
        const tasks = await Task.findAll({
            where: { projectId: projectIds },
            order: [['createdAt', 'DESC']]
        });

        // Lấy thông tin user để có assignee name
        const assigneeEmails = [...new Set(tasks.map(task => task.assignee))];
        const users = await User.findAll({
            where: { email: assigneeEmails },
            attributes: ['email', 'name']
        });

        // Tạo map email -> name
        const userMap = {};
        users.forEach(user => {
            userMap[user.email] = user.name;
        });

        // Format dữ liệu để trả về
        const formattedTasks = tasks.map(task => {
            const projectName = projectMap[task.projectId] || 'Không xác định';
            const assigneeName = userMap[task.assignee] || task.assignee;
            
            console.log('🔍 Task debug:', {
                id: task.id,
                title: task.title,
                projectId: task.projectId,
                projectName: projectName,
                assignee: task.assignee,
                assigneeName: assigneeName
            });
            
            return {
                id: task.id,
                title: task.title,
                difficulty: task.difficulty,
                estimatedTime: task.estimatedTime,
                assignee: task.assignee,
                assigneeName: assigneeName,
                deadline: task.deadline,
                status: task.status,
                projectId: task.projectId,
                projectName: projectName,
                createdAt: task.createdAt,
                completedAt: task.completedAt
            };
        });

        console.log('📋 Found', formattedTasks.length, 'assigned tasks');
        console.log('📋 Projects found:', projects.map(p => `${p.name} (ID: ${p.id})`));
        res.json(formattedTasks);

    } catch (error) {
        console.error('❌ Error getting assigned tasks:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách task đã giao' });
    }
};

export const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.status = status;
    if (status === 'Hoàn thành') {
        task.completedAt = new Date();
    } else {
        task.completedAt = null;
    }
    await task.save();
    res.json({ success: true });
};

// Lấy tasks của user trong một project cụ thể
export const getTasksByProjectAndUser = async (req, res) => {
    try {
        const { projectId, email } = req.params;
        
        if (!projectId || !email) {
            return res.status(400).json({ error: 'Project ID and email are required' });
        }

        console.log('🔍 Getting tasks for user:', email, 'in project:', projectId);

        // Kiểm tra user có thuộc project không
        const membership = await ProjectMember.findOne({
            where: { projectId, email }
        });

        if (!membership) {
            return res.status(403).json({ error: 'User is not a member of this project' });
        }

        // Lấy tasks được giao cho user trong project này
        const tasks = await Task.findAll({
            where: { 
                projectId,
                assignee: email 
            },
            include: [{
                model: Project,
                as: 'project',
                attributes: ['id', 'name', 'owner']
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log('✅ Found tasks:', tasks.length);

        // Format response với thông tin chi tiết
        const formattedTasks = tasks.map(task => ({
            id: task.id,
            title: task.title,
            difficulty: task.difficulty,
            estimatedTime: task.estimatedTime,
            status: task.status,
            deadline: task.deadline,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            projectName: task.project?.name,
            projectOwner: task.project?.owner
        }));

        res.json(formattedTasks);
        
    } catch (error) {
        console.error('❌ Error getting project tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy thống kê tasks của user
export const getTaskStatsByUser = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Tổng số tasks
        const totalTasks = await Task.count({ where: { assignee: email } });
        
        // Tasks hoàn thành
        const completedTasks = await Task.count({ 
            where: { 
                assignee: email,
                status: 'Hoàn thành'
            }
        });
        
        // Tasks đang làm
        const inProgressTasks = await Task.count({ 
            where: { 
                assignee: email,
                status: 'Đang làm'
            }
        });
        
        // Tasks chưa hoàn thành
        const pendingTasks = await Task.count({ 
            where: { 
                assignee: email,
                status: 'Chưa hoàn thành'
            }
        });

        res.json({
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        });
        
    } catch (error) {
        console.error('❌ Error getting task stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
