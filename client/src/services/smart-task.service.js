// Smart task service: các hàm gọi API cho SmartTaskAssigner
import { API_BASE_URL } from '../config/api.js';

export async function getProjectMembers(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin dự án');
    const project = await res.json();
    return project.members || [];
}

export async function getUserSkill(email) {
    const res = await fetch(`${API_BASE_URL}/users/${email}`);
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin user');
    return res.json();
}
