import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';

export const createProject = async (req, res) => {
    const { name, owner } = req.body;
    const project = await Project.create({ name, owner });
    await ProjectMember.create({ projectId: project.id, email: owner });
    res.json(project);
};

export const addMember = async (req, res) => {
    const { email } = req.body;
    const { id } = req.params;
    const exist = await ProjectMember.findOne({ where: { projectId: id, email } });
    if (exist) return res.status(400).json({ error: 'Thành viên đã tồn tại' });
    await ProjectMember.create({ projectId: id, email });
    res.json({ message: 'Thêm thành viên thành công' });
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
