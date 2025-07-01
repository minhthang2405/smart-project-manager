import React, { useState, useEffect } from "react";
import SmartTaskAssigner from "./SmartTaskAssigner";
import ProjectInvitationStatus from "./ProjectInvitationStatus";
import { getProjectsByOwner, getProjectDetail, createProject, addMemberToProject } from "../services/project.service";

export default function ProjectManager({ user }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "info"

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
    if (!newMemberEmail.trim()) {
      setMessage("Vui lòng nhập email thành viên");
      setMessageType("error");
      return;
    }

    try {
      const result = await addMemberToProject(projectId, newMemberEmail);
      
      // Fetch lại danh sách project để cập nhật members mới nhất
      const updatedProjects = await getProjectsByOwner(user.email);
      setProjects(updatedProjects.map(p => ({ ...p, members: p.members || [] })));
      
      setNewMemberEmail("");
      setSelectedProjectId(null);
      setMessage(result.message || "Gửi lời mời thành công!");
      setMessageType("success");
      
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      setMessage(error.message);
      setMessageType("error");
    }
    
    // Xóa thông báo sau 5 giây
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const getProjectNameById = (id) =>
    projects.find((p) => p.id === id)?.name || "Dự án không rõ";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8 transition-all duration-200">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">🛠️ Quản lý Dự án</h2>
      
      {/* Hiển thị thông báo */}
      {message && (
        <div className={`p-3 rounded mb-4 border ${
          messageType === "success" 
            ? "bg-green-50 text-green-700 border-green-200"
            : messageType === "error"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {message}
        </div>
      )}
      {/* Tạo dự án mới */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
          ✨ Tạo Dự Án Mới
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
              placeholder="Nhập tên dự án (ví dụ: Website Bán Hàng, Mobile App...)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createProjectHandler()}
            />
          </div>
          <button
            onClick={createProjectHandler}
            disabled={!newProjectName.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <span>🚀</span>
            Tạo Dự Án
          </button>
        </div>
        {newProjectName.trim() && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Xem trước:</span> Dự án "{newProjectName}" sẽ được tạo với bạn là chủ dự án
          </div>
        )}
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
                        📧 Gửi lời mời
                      </button>
                    </div>
                    <ul className="ml-2 list-disc text-sm text-gray-700">
                      {members.length === 0 ? (
                        <li>Chưa có thành viên nào.</li>
                      ) : (
                        members.map((m, idx) => <li key={idx}>{m}</li>)
                      )}
                    </ul>
                    <ProjectInvitationStatus projectId={project.id} />
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
