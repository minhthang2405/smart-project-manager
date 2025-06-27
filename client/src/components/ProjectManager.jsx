import React, { useState, useEffect } from "react";
import SmartTaskAssigner from "./SmartTaskAssigner";
import { getProjectsByOwner, getProjectDetail, createProject, addMemberToProject } from "../services/project.service";

export default function ProjectManager({ user }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);

  useEffect(() => {
    getProjectsByOwner(user.email)
      .then((data) => {
        setProjects(data.map(p => ({ ...p, members: p.members || [] })));
      });
  }, [user.email]);

  // Fetch chi tiết project khi chọn
  useEffect(() => {
    if (selectedProjectId) {
      getProjectDetail(selectedProjectId)
        .then(data => setSelectedProjectDetail(data));
    } else {
      setSelectedProjectDetail(null);
    }
  }, [selectedProjectId]);

  const createProjectHandler = async () => {
    if (!newProjectName.trim()) return;
    const project = await createProject(newProjectName, user.email);
    setProjects([...projects, { ...project, members: [user.email] }]);
    setNewProjectName("");
  };

  const addMember = async (projectId) => {
    if (!newMemberEmail.trim()) return;
    const data = await addMemberToProject(projectId, newMemberEmail);
    // Fetch lại danh sách project để cập nhật members mới nhất
    getProjectsByOwner(user.email)
      .then((data) => {
        setProjects(data.map(p => ({ ...p, members: p.members || [] })));
      });
    setNewMemberEmail("");
    setSelectedProjectId(null);
  };

  const getProjectNameById = (id) =>
    projects.find((p) => p.id === id)?.name || "Dự án không rõ";

  const sendInviteEmail = async (memberEmail, projectName) => {
    try {
      const res = await fetch("http://localhost:5000/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberEmail,
          projectName,
          leaderEmail: user.email,
        }),
      });
      const data = await res.json();
      console.log("📨 Email:", data.message);
    } catch (err) {
      console.error("❌ Gửi email thất bại:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8 transition-all duration-200">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">🛠️ Quản lý Dự án</h2>
      {/* Tạo dự án */}
      <div className="flex gap-2 mb-6">
        <input
          className="input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Nhập tên dự án"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button
          onClick={createProjectHandler}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all duration-200"
        >
          ➕ Tạo dự án
        </button>
      </div>
      {/* Danh sách dự án */}
      {projects.length === 0 ? (
        <p className="text-gray-500">Chưa có dự án nào.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => {
            const members = project.members || [];
            return (
              <li
                key={project.id}
                className={`p-4 bg-gray-50 rounded-xl border hover:shadow-lg transition-all duration-200 ${selectedProjectId === project.id ? 'border-indigo-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      👑 Chủ dự án: {project.owner}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedProjectId === project.id ? "✖ Đóng" : "👥 Quản lý thành viên"}
                    </button>
                    <button
                      onClick={() => setSelectedProjectId(project.id)}
                      className="text-indigo-600 hover:underline"
                      disabled={selectedProjectId === project.id}
                    >
                      {selectedProjectId === project.id ? "Đang chọn" : "Chọn để giao task"}
                    </button>
                  </div>
                </div>
                {/* Form thêm thành viên */}
                {selectedProjectId === project.id && (
                  <div className="mt-3">
                    <div className="flex gap-2 mb-2">
                      <input
                        className="input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                        placeholder="Email thành viên"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                      <button
                        onClick={() => addMember(project.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-all duration-200"
                      >
                        ➕ Thêm
                      </button>
                    </div>
                    <ul className="ml-2 list-disc text-sm text-gray-700">
                      {members.length === 0 ? (
                        <li>Chưa có thành viên nào.</li>
                      ) : (
                        members.map((m, idx) => <li key={idx}>{m}</li>)
                      )}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {/* Hiển thị chi tiết project khi đã chọn */}
      {selectedProjectDetail && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <h4 className="font-bold text-indigo-700 text-lg mb-2">Chi tiết dự án</h4>
          <div><b>Tên dự án:</b> {selectedProjectDetail.name}</div>
          <div><b>Chủ dự án:</b> {selectedProjectDetail.owner}</div>
          <div><b>Thành viên:</b> {selectedProjectDetail.members && selectedProjectDetail.members.length > 0 ? selectedProjectDetail.members.join(", ") : "Chưa có thành viên"}</div>
        </div>
      )}
      {/* Hiển thị SmartTaskAssigner khi đã chọn project và projectId hợp lệ */}
      {selectedProjectId && <SmartTaskAssigner projectId={selectedProjectId} />}
    </div>
  );
}
