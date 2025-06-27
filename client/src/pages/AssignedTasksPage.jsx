import React, { useEffect, useState } from "react";

export default function AssignedTasksPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy các task do user này giao (owner là user.email)
    fetch(`http://localhost:5000/tasks/assigned?owner=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, [user.email]);

  const now = new Date();
  const completedTasks = tasks.filter(t => t.status === "Hoàn thành");
  const uncompletedTasks = tasks.filter(t => t.status !== "Hoàn thành");

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🗂️ Quản lý Task đã giao</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">Bạn chưa giao task nào.</p>
      ) : (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">Task chưa hoàn thành</h3>
          <ul className="space-y-4">
            {uncompletedTasks.map((task) => {
              const deadline = task.deadline ? new Date(task.deadline) : null;
              const isLate = deadline && now > deadline;
              return (
                <li key={task.id} className="p-4 bg-gray-50 rounded border hover:shadow">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">
                    Người nhận: <strong>{task.assignee}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Thời hạn: {deadline ? deadline.toLocaleString() : "Không đặt"}
                    {isLate && <span className="ml-2 text-red-600 font-bold">(Trễ hạn)</span>}
                  </p>
                  <p className="text-sm text-gray-600">
                    Trạng thái: <span className={task.status === "Hoàn thành" ? "text-green-600" : "text-yellow-600"}>{task.status}</span>
                  </p>
                </li>
              );
            })}
          </ul>
          <h3 className="text-lg font-semibold mt-8 mb-2">Task đã hoàn thành</h3>
          <ul className="space-y-4">
            {completedTasks.length === 0 ? (
              <li className="text-gray-500">Chưa có task nào hoàn thành.</li>
            ) : (
              completedTasks.map((task) => (
                <li key={task.id} className="p-4 bg-green-50 rounded border hover:shadow">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">
                    Người nhận: <strong>{task.assignee}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Hoàn thành lúc: {task.completedAt ? new Date(task.completedAt).toLocaleString() : "Không rõ"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
} 