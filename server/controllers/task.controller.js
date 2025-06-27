import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';

export const createTask = async (req, res, transporter) => {
    const { title, difficulty, estimatedTime, assignee, deadline } = req.body;
    const { id } = req.params;
    const task = await Task.create({ title, difficulty, estimatedTime, assignee, projectId: id, deadline });
    try {
        await transporter.sendMail({
            from: `"SmartPM" <${process.env.EMAIL}>`,
            to: assignee,
            subject: `📝 Bạn được giao nhiệm vụ mới trong dự án!`,
            text: `Bạn vừa được giao task "${title}" trong dự án. Độ khó: ${difficulty}, thời gian dự kiến: ${estimatedTime}. Vui lòng đăng nhập để xem chi tiết!`,
        });
    } catch (err) {
        console.error('❌ Gửi email task lỗi:', err);
    }
    res.json(task);
};

export const getTasksByEmail = async (req, res) => {
    const { email } = req.query;
    const tasks = await Task.findAll({ where: { assignee: email } });
    res.json(tasks);
};

export const getAssignedTasks = async (req, res) => {
    const { owner } = req.query;
    if (!owner) return res.status(400).json({ error: 'Thiếu owner' });
    const projects = await Project.findAll({ where: { owner } });
    const projectIds = projects.map(p => p.id);
    const tasks = await Task.findAll({ where: { projectId: projectIds } });
    res.json(tasks);
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
