import React, { useState, useEffect } from "react";

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
  const [members, setMembers] = useState([]);
  const [memberSkills, setMemberSkills] = useState({});

  console.log("projectId truyền vào SmartTaskAssigner:", projectId);

  // Lấy danh sách thành viên của project
  useEffect(() => {
    if (!projectId) return;
    fetch(`http://localhost:5000/projects/${projectId}`)
      .then(async (res) => {
        if (!res.ok) {
          setMembers([]);
          setMessage("Không tìm thấy dự án hoặc dự án đã bị xóa.");
          return null;
        }
        return res.json();
      })
      .then((project) => {
        if (project && project.members) {
          setMembers(project.members);
        } else {
          setMembers([]);
        }
      })
      .catch((err) => {
        setMembers([]);
        setMessage("Lỗi khi lấy thông tin dự án.");
      });
  }, [projectId]);

  // Lấy điểm skill của từng thành viên
  useEffect(() => {
    if (members.length === 0) return;
    Promise.all(
      members.map((email) =>
        fetch(`http://localhost:5000/users/${email}`)
          .then((res) => res.json())
          .then((data) => {
            console.log('User:', data);
            return { email, ...data };
          })
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
    const skillKey = SKILL_MAP[mainSkill] || "frontend";
    const sorted = members
      .map((email) => ({
        email,
        score: memberSkills[email]?.[skillKey] ?? 0,
        name: memberSkills[email]?.name || email,
      }))
      .sort((a, b) => b.score - a.score);
    setSuggested(sorted[0]);
    setAssignee(sorted[0]?.email || "");
  };

  const assignTask = async () => {
    if (!projectId) {
      setMessage("Bạn phải chọn dự án trước khi giao task!");
      return;
    }
    if (!taskName || !assignee) {
      setMessage("Vui lòng nhập đầy đủ thông tin task và email người nhận!");
      return;
    }
    const res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskName,
        difficulty,
        estimatedTime,
        assignee,
        deadline,
      }),
    });
    if (res.ok) setMessage("Đã giao task và gửi mail thành công!");
    else setMessage("Lỗi khi giao task!");
  };

  if (!projectId) {
    return <div className="text-red-600 font-semibold mt-4">Bạn phải chọn dự án trước khi giao task!</div>;
  }

  if (members.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          🤖 Phân chia công việc bằng AI
        </h2>
        {message && <div className="text-red-600 mb-4">{message}</div>}
        <div className="grid md:grid-cols-5 gap-4 mb-4">
          <input
            className="input"
            placeholder="Tên công việc"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <select
            className="input"
            value={mainSkill}
            onChange={(e) => setMainSkill(e.target.value)}
          >
            <option>Frontend</option>
            <option>Backend</option>
            <option>AI</option>
            <option>Devops</option>
            <option>Mobile</option>
            <option>UXUI</option>
            <option>Testing</option>
            <option>Management</option>
          </select>
          <select
            className="input"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Dễ</option>
            <option>Trung bình</option>
            <option>Khó</option>
          </select>
          <input
            className="input"
            placeholder="Thời gian dự kiến"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
          <input
            className="input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            title="Chọn thời hạn hoàn thành"
          />
        </div>
        <button
          onClick={suggestMember}
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
        >
          Đề xuất người phù hợp
        </button>
        {suggested && (
          <div className="mt-4 text-lg">
            🔍 Gợi ý: <strong>{suggested.name}</strong> ({suggested.email})<br/>
            Kỹ năng {mainSkill}: <span className="font-bold text-indigo-700">{suggested.score}/10</span>
          </div>
        )}
        <div className="mt-4 flex gap-2 items-center">
          <select
            className="input"
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
          <button
            onClick={assignTask}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Giao task
          </button>
        </div>
        {message && <div className="mt-2 text-blue-600">{message}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        🤖 Phân chia công việc bằng AI
      </h2>
      {message && <div className="text-red-600 mb-4">{message}</div>}
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <input
          className="input"
          placeholder="Tên công việc"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <select
          className="input"
          value={mainSkill}
          onChange={(e) => setMainSkill(e.target.value)}
        >
          <option>Frontend</option>
          <option>Backend</option>
          <option>AI</option>
          <option>Devops</option>
          <option>Mobile</option>
          <option>UXUI</option>
          <option>Testing</option>
          <option>Management</option>
        </select>
        <select
          className="input"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Dễ</option>
          <option>Trung bình</option>
          <option>Khó</option>
        </select>
        <input
          className="input"
          placeholder="Thời gian dự kiến"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
        />
        <input
          className="input"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          title="Chọn thời hạn hoàn thành"
        />
      </div>
      <button
        onClick={suggestMember}
        className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
      >
        Đề xuất người phù hợp
      </button>
      {suggested && (
        <div className="mt-4 text-lg">
          🔍 Gợi ý: <strong>{suggested.name}</strong> ({suggested.email})<br/>
          Kỹ năng {mainSkill}: <span className="font-bold text-indigo-700">{suggested.score}/10</span>
        </div>
      )}
      <div className="mt-4 flex gap-2 items-center">
        <select
          className="input"
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
        <button
          onClick={assignTask}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Giao task
        </button>
      </div>
      {message && <div className="mt-2 text-blue-600">{message}</div>}
    </div>
  );
}
