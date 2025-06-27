import React, { useState, useEffect } from "react";
import ProjectManager from "./ProjectManager";
import MemberTasks from "./MemberTasks";
import SmartTaskAssigner from "./SmartTaskAssigner";
import AssignedTasksPage from "../pages/AssignedTasksPage";

const SKILL_FIELDS = [
  "frontend", "backend", "ai", "devops", "mobile", "uxui", "testing", "management"
];

function UserSkillForm({ user, onSaved }) {
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/users/${user.email}`)
      .then(res => res.json())
      .then(data => {
        setSkills(SKILL_FIELDS.reduce((acc, f) => ({ ...acc, [f]: data[f] ?? 0 }), {}));
        setLoading(false);
      });
  }, [user.email]);

  const handleChange = (field, value) => {
    setSkills(s => ({ ...s, [field]: Math.max(0, Math.min(10, Number(value) || 0)) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`http://localhost:5000/users/${user.email}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skills),
    });
    if (res.ok) onSaved();
    else setError("Lỗi khi lưu điểm skill!");
    setSaving(false);
  };

  if (loading) return <div>Đang tải thông tin skill...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border border-gray-200 max-w-lg mx-auto mt-10 animate-fade-in">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🎯 Nhập điểm kỹ năng cá nhân</h2>
      <p className="mb-4 text-gray-600">Vui lòng nhập điểm (0-10) cho từng kỹ năng của bạn:</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {SKILL_FIELDS.map(f => (
          <div key={f} className="flex flex-col">
            <label className="font-medium capitalize mb-1">{f}</label>
            <input
              type="number"
              min={0}
              max={10}
              className="input"
              value={skills[f]}
              onChange={e => handleChange(f, e.target.value)}
              required
            />
          </div>
        ))}
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold" disabled={saving}>
        {saving ? "Đang lưu..." : "Lưu điểm kỹ năng"}
      </button>
    </form>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [userSkillOk, setUserSkillOk] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/users/${user.email}`)
      .then(res => res.json())
      .then(data => {
        // Nếu thiếu điểm hoặc điểm = 0 thì bắt nhập
        const ok = SKILL_FIELDS.every(f => typeof data[f] === 'number' && data[f] > 0);
        setUserSkillOk(ok);
        setShowSkillForm(!ok);
      });
  }, [user.email]);

  if (showSkillForm) {
    return <UserSkillForm user={user} onSaved={() => { setShowSkillForm(false); setUserSkillOk(true); }} />;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          👋 Xin chào, {user.email}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Đăng xuất
          </button>
          <button
            onClick={() => setShowSkillForm(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Chỉnh sửa điểm skill
          </button>
        </div>
      </div>
      <ProjectManager user={user} />
      <SmartTaskAssigner user={user} />
      <MemberTasks user={user} />
      <AssignedTasksPage user={user} />
    </div>
  );
}
