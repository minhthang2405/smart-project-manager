// Smart task service: các hàm gọi API cho SmartTaskAssigner

export async function getProjectMembers(projectId) {
    const res = await fetch(`http://localhost:5000/projects/${projectId}`);
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin dự án');
    const project = await res.json();
    return project.members || [];
}

export async function getUserSkill(email) {
    const res = await fetch(`http://localhost:5000/users/${email}`);
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin user');
    return res.json();
}
