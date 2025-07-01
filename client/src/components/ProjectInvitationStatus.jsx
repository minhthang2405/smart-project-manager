import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

function ProjectInvitationStatus({ projectId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchInvitations();
    }
  }, [projectId]);

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/project/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lời mời:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Đang chờ phản hồi';
      case 'accepted': return '✅ Đã tham gia';
      case 'rejected': return '❌ Đã từ chối';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Đang tải thông tin lời mời...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  const pendingInvites = invitations.filter(inv => inv.status === 'pending');
  const respondedInvites = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div className="mt-4 space-y-3">
      {pendingInvites.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Lời mời đang chờ phản hồi:</h5>
          <div className="space-y-1">
            {pendingInvites.map((invitation) => (
              <div
                key={invitation.id}
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(invitation.status)}`}
              >
                {invitation.email} - {getStatusText(invitation.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {respondedInvites.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Phản hồi gần đây:</h5>
          <div className="space-y-1">
            {respondedInvites.slice(0, 3).map((invitation) => (
              <div
                key={invitation.id}
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(invitation.status)}`}
              >
                {invitation.email} - {getStatusText(invitation.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectInvitationStatus;
