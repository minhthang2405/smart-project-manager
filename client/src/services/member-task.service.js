// Member task service: các hàm gọi API liên quan đến task của member
import { API_BASE_URL } from '../config/api.js';

export async function getTasksByEmail(email) {
    const res = await fetch(`${API_BASE_URL}/tasks?email=${email}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách task');
    return res.json();
}

export async function markTaskComplete(taskId) {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Hoàn thành" }),
    });
    if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái task');
    return res.json();
}
