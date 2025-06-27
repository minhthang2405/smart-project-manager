import React, { useState, useEffect } from "react";
import { getProjectMembers, getUserSkill } from "../services/smart-task.service";
import { useAssignTask } from "../hooks/useAssignTask";

const SKILL_MAP = {
  Frontend: "frontend",
  Backend: "backend",
  AI: "ai",
  Devops: "devops",
  Mobile: "mobile",
  UXUI: "uxui",
  Testing: "testing",
  Management: "management",
};

export default function SmartTaskAssigner({ projectId }) {
  const [taskName, setTaskName] = useState("");
  const [mainSkill, setMainSkill] = useState("Frontend");
  const [difficulty, setDifficulty] = useState("Trung bình");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [suggested, setSuggested] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [members, setMembers] = useState([]);
  const [memberSkills, setMemberSkills] = useState({});

  const {
    assignTask: assignTaskApi,
    loading: assigning,
  } = useAssignTask();

  useEffect(() => {
    if (!projectId) return;
    setMessage("Đang tải thông tin dự án...");
    setMessageType("info");

    getProjectMembers(projectId)
      .then((members) => {
        setMembers(members);
        setMessage("");
      })
      .catch(() => {
        setMembers([]);
        setMessage("Lỗi khi lấy thông tin dự án.");
        setMessageType("error");
      });
  }, [projectId]);

  useEffect(() => {
    if (members.length === 0) return;

    Promise.all(
      members.map((email) =>
        getUserSkill(email).then((data) => ({ email, ...data }))
      )
    ).then((arr) => {
      const skills = {};
      arr.forEach((u) => {
        skills[u.email] = u;
      });
      setMemberSkills(skills);
    });
  }, [members]);

  const suggestMember = () => {
    if (members.length === 0) {
      setMessage("Không có thành viên nào trong dự án.");
      setMessageType("error");
      return;
    }

    const skillKey = SKILL_MAP[mainSkill] || "frontend";
    const sorted = members
      .map((email) => ({
        email,
        score: memberSkills[email]?.[skillKey] ?? 0,
        name: memberSkills[email]?.name || email,
      }))
      .sort((a, b) => b.score - a.score);

    if (sorted.length > 0) {
      setSuggested(sorted[0]);
      setAssignee(sorted[0]?.email || "");
      setMessage("");
    } else {
      setMessage("Không tìm thấy thành viên phù hợp.");
      setMessageType("error");
    }
  };

  const assignTask = async () => {
    setMessage("");

    if (!projectId) {
      setMessage("Bạn phải chọn dự án trước khi giao task!");
      setMessageType("error");
      return;
    }

    if (!taskName) {
      setMessage("Vui lòng nhập tên công việc!");
      setMessageType("error");
      return;
    }

    if (!assignee) {
      setMessage("Vui lòng chọn người nhận task!");
      setMessageType("error");
      return;
    }

    try {
      await assignTaskApi({
        projectId,
        taskName,
        difficulty,
        estimatedTime,
        assignee,
        deadline,
      });

      setMessage("🎉 Giao task thành công và đã gửi email!");
      setMessageType("success");

      // Reset form
      setTaskName("");
      setMainSkill("Frontend");
      setDifficulty("Trung bình");
      setEstimatedTime("");
      setDeadline("");
      setAssignee("");
      setSuggested(null);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setMessage("Lỗi khi giao task: " + (err.message || "Không xác định"));
      setMessageType("error");
    }
  };

  const renderTaskForm = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">Tên công việc:</label>
          <input
            id="taskName"
            className="input w-full"
            placeholder="Nhập tên công việc"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="mainSkill" className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng chính:</label>
          <select
            id="mainSkill"
            className="input w-full"
            value={mainSkill}
            onChange={(e) => setMainSkill(e.target.value)}
          >
            {Object.keys(SKILL_MAP).map((skill) => (
              <option key={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Độ khó:</label>
          <select
            id="difficulty"
            className="input w-full"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Dễ</option>
            <option>Trung bình</option>
            <option>Khó</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian dự kiến:</label>
          <input
            id="estimatedTime"
            className="input w-full"
            placeholder="Ví dụ: 3 ngày"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">Thời hạn:</label>
          <input
            id="deadline"
            className="input w-full"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={suggestMember}
            className="bg-indigo-600 text-white w-full px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Đề xuất người phù hợp
          </button>
        </div>
      </div>

      {suggested && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-lg">
            🔍 <span className="font-medium">Gợi ý:</span> <strong>{suggested.name}</strong> ({suggested.email})
          </p>
          <p>
            Kỹ năng {mainSkill}: <span className="font-bold text-indigo-700">{suggested.score}/10</span>
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">Người nhận task:</label>
          <select
            id="assignee"
            className="input w-full"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">-- Chọn người nhận --</option>
            {members.map(email => (
              <option key={email} value={email}>
                {memberSkills[email]?.name || email} ({email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={assignTask}
            disabled={assigning}
            className={`px-6 py-2 rounded font-medium transition-colors ${assigning ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white w-full sm:w-auto`}
          >
            {assigning ? "Đang xử lý..." : "Giao task"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {message && (
        <div className={`p-3 rounded mb-4 ${messageType === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : messageType === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
          {message}
        </div>
      )}

      {!projectId ? null : members.length === 0 ? (
        <div className="text-amber-600 font-medium p-4 bg-amber-50 rounded-lg border border-amber-200">
          Dự án chưa có thành viên nào hoặc đang tải thông tin...
        </div>
      ) : (
        renderTaskForm()
      )}
    </>
  );
}
