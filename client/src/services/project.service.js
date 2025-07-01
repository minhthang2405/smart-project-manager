// Project service: các hàm gọi API liên quan đến project
import { API_BASE_URL } from '../config/api.js';

export async function getProjectsByOwner(ownerEmail) {
    const res = await fetch(`${API_BASE_URL}/projects?owner=${ownerEmail}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách project');
    return res.json();
}

export async function getProjectDetail(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!res.ok) throw new Error('Lỗi khi lấy chi tiết project');
    return res.json();
}

export async function createProject(name, owner) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, owner }),
    });
    if (!res.ok) throw new Error('Lỗi khi tạo project');
    return res.json();
}

export async function addMemberToProject(projectId, email) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi thêm thành viên');
    }
    
    return res.json();
}
