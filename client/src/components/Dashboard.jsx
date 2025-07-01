import React, { useState, useEffect } from "react";
import ProjectManager from "./ProjectManager";
import JoinedProjects from "./JoinedProjects";
import AssignedTasksManager from "./AssignedTasksManager";
import UnifiedSkillForm from "./UnifiedSkillForm";
import { getUserByEmail, updateUserSkills } from "../services/user.service";

const SKILL_FIELDS = [
  "frontend", "backend", "ai", "devops", "mobile", "uxui", "testing", "management"
];

function UserSkillForm({ user, onSaved }) {
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserByEmail(user.email)
      .then(data => {
        setSkills(SKILL_FIELDS.reduce((acc, f) => ({ ...acc, [f]: data[f] ?? 0 }), {}));
        setLoading(false);
      })
      .catch(() => setError("Lỗi khi tải thông tin skill!"));
  }, [user.email]);

  const handleSkillSubmit = async (updatedSkills) => {
    setSaving(true);
    setError("");

    try {
      await updateUserSkills(user.email, updatedSkills);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div>Đang tải thông tin skill...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <UnifiedSkillForm
      initialSkills={skills}
      onSubmit={handleSkillSubmit}
      loading={saving}
      title="Cập nhật Kỹ Năng Cá Nhân"
      submitText="Lưu kỹ năng"
      showCancel={true}
      onCancel={onSaved}
    />
  );
}

export default function Dashboard({ user, onLogout, showSkillForm, setShowSkillForm }) {
  useEffect(() => {
    if (!showSkillForm) {
      getUserByEmail(user.email)
        .then(data => {
          const ok = SKILL_FIELDS.every(f => typeof data[f] === 'number' && data[f] > 0);
          setShowSkillForm(!ok);
        })
        .catch(() => setShowSkillForm(true));
    }
  }, [user.email, showSkillForm, setShowSkillForm]);

  if (showSkillForm) {
    return <UserSkillForm user={user} onSaved={() => setShowSkillForm(false)} />;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-indigo-100 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">

          <button
            onClick={() => setShowSkillForm(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Chỉnh sửa điểm skill
          </button>
        </div>
      </div>
      <ProjectManager user={user} />
      <AssignedTasksManager user={user} />
      <JoinedProjects user={user} />
    </div>
  );
}