import React, { useState, useEffect } from 'react';
import { getAssignedTasks } from '../services/task.service';

const TASK_STATUS = {
  'Chưa hoàn thành': { label: 'Chưa làm', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  'Đang làm': { label: 'Đang làm', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  'Hoàn thành': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: '✅' },
  // Fallback cho các status cũ
  'pending': { label: 'Chưa làm', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  'in-progress': { label: 'Đang làm', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: '✅' }
};

export default function AssignedTasksManager({ user }) {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAssignedTasks();
  }, [user.email]);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const tasks = await getAssignedTasks(user.email);
      setAssignedTasks(tasks);
    } catch (err) {
      setError('Không thể tải danh sách task đã giao');
      console.error('Error fetching assigned tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Nhóm task theo dự án
  const tasksByProject = assignedTasks.reduce((acc, task) => {
    const projectName = task.projectName || 'Không xác định';
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {});

  // Nhóm task theo assignee để filter
  const tasksByAssignee = assignedTasks.reduce((acc, task) => {
    const assigneeName = task.assigneeName || task.assignee || 'Không xác định';
    if (!acc[assigneeName]) {
      acc[assigneeName] = [];
    }
    acc[assigneeName].push(task);
    return acc;
  }, {});

  // Lọc task theo nhiều tiêu chí
  const filteredTasks = assignedTasks.filter(task => {
    // Lọc theo dự án
    if (selectedProject !== 'all' && task.projectName !== selectedProject) {
      return false;
    }
    
    // Lọc theo trạng thái
    if (selectedStatus !== 'all' && task.status !== selectedStatus) {
      return false;
    }
    
    // Lọc theo độ khó
    if (selectedDifficulty !== 'all') {
      const difficulty = parseInt(task.difficulty);
      if (selectedDifficulty === 'easy' && difficulty > 3) return false;
      if (selectedDifficulty === 'medium' && (difficulty <= 3 || difficulty > 7)) return false;
      if (selectedDifficulty === 'hard' && difficulty <= 7) return false;
    }
    
    return true;
  });

  // Sắp xếp task
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      case 'difficulty':
        return parseInt(b.difficulty) - parseInt(a.difficulty);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Thống kê task
  const taskStats = assignedTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Đang tải task...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
        📋 Task Đã Giao
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-800">{assignedTasks.length}</div>
          <div className="text-sm text-gray-600">Tổng Task</div>
        </div>
        {['Chưa hoàn thành', 'Đang làm', 'Hoàn thành'].map((status) => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{taskStats[status] || 0}</div>
            <div className="text-sm text-gray-600">{TASK_STATUS[status]?.label}</div>
          </div>
        ))}
      </div>

      {/* Bộ lọc và sắp xếp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Filter theo dự án */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dự án:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả dự án</option>
            {Object.keys(tasksByProject).map(projectName => (
              <option key={projectName} value={projectName}>
                {projectName} ({tasksByProject[projectName].length})
              </option>
            ))}
          </select>
        </div>

        {/* Filter theo trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chưa hoàn thành">⏳ Chưa làm ({taskStats['Chưa hoàn thành'] || 0})</option>
            <option value="Đang làm">🔄 Đang làm ({taskStats['Đang làm'] || 0})</option>
            <option value="Hoàn thành">✅ Hoàn thành ({taskStats['Hoàn thành'] || 0})</option>
          </select>
        </div>

        {/* Filter theo độ khó */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ khó:
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="easy">🟢 Dễ (1-3)</option>
            <option value="medium">🟡 Trung bình (4-7)</option>
            <option value="hard">🔴 Khó (8-10)</option>
          </select>
        </div>

        {/* Sắp xếp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">🕒 Mới nhất</option>
            <option value="oldest">⏰ Cũ nhất</option>
            <option value="deadline">📅 Gần deadline</option>
            <option value="difficulty">⚡ Độ khó cao</option>
            <option value="title">🔤 Tên A-Z</option>
          </select>
        </div>
      </div>

      {/* Thông tin kết quả lọc */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div>
          Hiển thị <span className="font-semibold">{sortedTasks.length}</span> trong tổng số <span className="font-semibold">{assignedTasks.length}</span> task
          {sortedTasks.length !== assignedTasks.length && (
            <span className="ml-2 text-indigo-600">
              (đã lọc)
            </span>
          )}
        </div>
        {sortedTasks.length !== assignedTasks.length && (
          <button 
            onClick={() => {
              setSelectedProject('all');
              setSelectedStatus('all');
              setSelectedDifficulty('all');
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Danh sách task */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p>
            {filteredTasks.length === 0 && assignedTasks.length > 0 
              ? 'Không có task nào phù hợp với bộ lọc.' 
              : 'Chưa có task nào được giao.'
            }
          </p>
          {filteredTasks.length === 0 && assignedTasks.length > 0 && (
            <button 
              onClick={() => {
                setSelectedProject('all');
                setSelectedStatus('all');
                setSelectedDifficulty('all');
              }}
              className="mt-2 text-indigo-600 hover:text-indigo-800 underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TASK_STATUS[task.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {TASK_STATUS[task.status]?.icon} {TASK_STATUS[task.status]?.label || task.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Giao cho:</span> {task.assigneeName || task.assignee}
                    </div>
                    <div>
                      <span className="font-medium">Độ khó:</span> {task.difficulty}/10
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Thời gian ước tính:</span> {task.estimatedTime}h
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}
                    </div>
                  </div>

                  {task.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Mô tả:</span>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Tạo: {new Date(task.createdAt).toLocaleString('vi-VN')}</span>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <span>Cập nhật: {new Date(task.updatedAt).toLocaleString('vi-VN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nút refresh */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchAssignedTasks}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Đang tải...' : '🔄 Làm mới'}
        </button>
      </div>
    </div>
  );
}
