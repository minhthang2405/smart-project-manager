import React, { useState, useEffect } from "react";

function ConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fadein">
      <div className="bg-white p-7 rounded-2xl shadow-2xl w-96 relative animate-scalein">
        <div className="flex items-center mb-3">
          <span className="text-yellow-400 text-3xl mr-2">⚠️</span>
          <h3 className="text-xl font-bold text-gray-800">Xác nhận hoàn thành</h3>
        </div>
        <p className="mb-6 text-gray-700 leading-relaxed">Bạn có chắc chắn muốn đánh dấu <span className="font-semibold text-blue-700">hoàn thành</span>?<br/>Sau khi xác nhận sẽ <span className="font-semibold text-red-600">không thể quay lại</span> trạng thái chưa hoàn thành!</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition">Huỷ</button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Xác nhận</button>
        </div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scalein { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadein { animation: fadein 0.2s; }
        .animate-scalein { animation: scalein 0.22s cubic-bezier(.4,2,.6,1) ; }
      `}</style>
    </div>
  );
}

export default function MemberTasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [modalTaskId, setModalTaskId] = useState(null);

  const fetchTasks = () => {
    fetch(`http://localhost:5000/tasks?email=${user.email}`)
      .then((res) => res.json())
      .then(setTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleMarkComplete = (taskId) => {
    setModalTaskId(taskId);
  };

  const handleModalConfirm = async () => {
    if (!modalTaskId) return;
    await fetch(`http://localhost:5000/tasks/${modalTaskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Hoàn thành" }),
    });
    setModalTaskId(null);
    fetchTasks();
  };

  const handleModalCancel = () => {
    setModalTaskId(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        📋 Công việc của bạn
      </h2>

      <ConfirmModal open={!!modalTaskId} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />

      {tasks.length === 0 ? (
        <p className="text-gray-500">Bạn chưa được giao công việc nào.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 bg-gray-50 rounded border hover:shadow"
            >
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-600">
                Độ khó: <strong>{task.difficulty}</strong> – Thời gian dự kiến:{" "}
                {task.estimatedTime}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Trạng thái:{" "}
                <span
                  className={`font-medium ${
                    task.status === "Hoàn thành"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {task.status}
                </span>
              </p>
              {task.status !== "Hoàn thành" && (
                <button
                  onClick={() => handleMarkComplete(task.id)}
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  ✅ Đánh dấu hoàn thành
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
