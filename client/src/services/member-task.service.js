// Member task service: các hàm gọi API liên quan đến task của member

export async function getTasksByEmail(email) {
    const res = await fetch(`http://localhost:5000/tasks?email=${email}`);
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách task');
    return res.json();
}

export async function markTaskComplete(taskId) {
    const res = await fetch(`http://localhost:5000/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Hoàn thành" }),
    });
    if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái task');
    return res.json();
}
