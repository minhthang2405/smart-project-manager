// User service: các hàm gọi API liên quan đến user

export async function getUserByEmail(email) {
    const res = await fetch(`http://localhost:5000/users/${email}`);
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin user');
    return res.json();
}

export async function updateUserSkills(email, skills) {
    const res = await fetch(`http://localhost:5000/users/${email}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skills),
    });
    if (!res.ok) throw new Error('Lỗi khi lưu điểm skill!');
    return res.json();
}
