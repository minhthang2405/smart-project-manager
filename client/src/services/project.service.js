// Project service: các hàm gọi API liên quan đến project

export async function getProjectsByOwner(ownerEmail) {
    const res = await fetch(`http://localhost:5000/projects?owner=${ownerEmail}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách project');
    return res.json();
}

export async function getProjectDetail(projectId) {
    const res = await fetch(`http://localhost:5000/projects/${projectId}`);
    if (!res.ok) throw new Error('Lỗi khi lấy chi tiết project');
    return res.json();
}

export async function createProject(name, owner) {
    const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, owner }),
    });
    if (!res.ok) throw new Error('Lỗi khi tạo project');
    return res.json();
}

export async function addMemberToProject(projectId, email) {
    const res = await fetch(`http://localhost:5000/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Lỗi khi thêm thành viên');
    return res.json();
}
