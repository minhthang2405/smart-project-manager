// Task service: các hàm gọi API liên quan đến task

export async function getAssignedTasks(ownerEmail) {
    const res = await fetch(`http://localhost:5000/tasks/assigned?owner=${ownerEmail}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách task');
    return res.json();
}
