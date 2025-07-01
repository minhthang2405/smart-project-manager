// Task service: các hàm gọi API liên quan đến task
import { API_BASE_URL } from '../config/api.js';

export async function getAssignedTasks(ownerEmail) {
    const res = await fetch(`${API_BASE_URL}/tasks/assigned?owner=${ownerEmail}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách task');
    return res.json();
}
