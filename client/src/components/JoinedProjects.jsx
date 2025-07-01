import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

function JoinedProjects({ user }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectNotifications, setProjectNotifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchJoinedProjects();
    }
  }, [user]);

  const fetchJoinedProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects/joined/${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dự án');
      }
      
      const data = await response.json();
      setProjects(data);
      
      // Fetch notifications for each project
      await fetchProjectNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectNotifications = async (projectList) => {
    const notifications = {};
    
    for (const project of projectList) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${project.id}/tasks/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const tasks = await response.json();
          const incompleteTasks = tasks.filter(task => task.status !== 'Hoàn thành');
          notifications[project.id] = incompleteTasks.length;
        } else {
          notifications[project.id] = 0;
        }
      } catch (err) {
        notifications[project.id] = 0;
      }
    }
    
    setProjectNotifications(notifications);
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      setLoadingTasks(true);
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải công việc');
      }
      
      const data = await response.json();
      setProjectTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleProjectClick = (project) => {
    if (selectedProject?.id === project.id) {
      // Toggle - đóng project đang mở
      setSelectedProject(null);
      setProjectTasks([]);
    } else {
      // Mở project mới
      setSelectedProject(project);
      fetchProjectTasks(project.id);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái');
      }

      // Refresh tasks
      if (selectedProject) {
        fetchProjectTasks(selectedProject.id);
        // Update notification count for this project
        const updatedTasks = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/tasks/${encodeURIComponent(user.email)}`);
        if (updatedTasks.ok) {
          const tasks = await updatedTasks.json();
          const incompleteTasks = tasks.filter(task => task.status !== 'Hoàn thành');
          setProjectNotifications(prev => ({
            ...prev,
            [selectedProject.id]: incompleteTasks.length
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      case 'Đang làm': return 'bg-blue-100 text-blue-800';
      case 'Chưa hoàn thành': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Dễ': return 'bg-green-100 text-green-700';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-700';
      case 'Khó': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">👥</div>
        <h2 className="text-xl font-bold text-gray-800">Dự án đã tham gia</h2>
        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {projects.length}
        </span>
        {/* Total incomplete tasks notification */}
        {Object.values(projectNotifications).reduce((sum, count) => sum + count, 0) > 0 && (
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            🔔 {Object.values(projectNotifications).reduce((sum, count) => sum + count, 0)} task cần hoàn thành
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏗️</div>
          <p className="text-gray-500">Bạn chưa tham gia dự án nào</p>
          <p className="text-sm text-gray-400 mt-2">
            Hãy đợi được mời hoặc liên hệ quản lý dự án
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Project Header */}
              <div 
                className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {project.isOwner ? '👑' : '👤'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{project.name}</h3>
                      <p className="text-sm text-gray-500">
                        {project.isOwner ? 'Bạn là chủ dự án' : `Chủ dự án: ${project.owner}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.isOwner ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.role === 'owner' ? 'Chủ DA' : 'Thành viên'}
                    </span>
                    {/* Notification Badge */}
                    {projectNotifications[project.id] > 0 && (
                      <span className="relative">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {projectNotifications[project.id]} task chưa hoàn thành
                        </span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      </span>
                    )}
                    <div className="text-gray-400">
                      {selectedProject?.id === project.id ? '📖' : '📋'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Tasks */}
              {selectedProject?.id === project.id && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-lg">📝</div>
                    <h4 className="font-medium text-gray-700">Công việc được giao</h4>
                  </div>

                  {loadingTasks ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="animate-pulse h-20 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  ) : projectTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-gray-500">Chưa có công việc nào được giao</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectTasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{task.title}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>⏱️</span>
                              {task.estimatedTime}
                            </span>
                            {task.deadline && (
                              <span className="flex items-center gap-1">
                                <span>📅</span>
                                {new Date(task.deadline).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>

                          {/* Task Status Buttons */}
                          <div className="flex gap-2">
                            {task.status !== 'Đang làm' && task.status !== 'Hoàn thành' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'Đang làm')}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Bắt đầu làm
                              </button>
                            )}
                            {task.status === 'Đang làm' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'Hoàn thành')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Hoàn thành
                              </button>
                            )}
                            {task.status === 'Hoàn thành' && task.completedAt && (
                              <span className="text-xs text-green-600">
                                ✅ Hoàn thành: {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JoinedProjects;
