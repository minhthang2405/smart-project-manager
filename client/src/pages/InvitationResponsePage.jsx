import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

function InvitationResponsePage() {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const action = searchParams.get('action');

  useEffect(() => {
    if (!token || !action) {
      setError('Liên kết không hợp lệ');
      setLoading(false);
      return;
    }

    // Nếu là accept, chuyển thẳng đến trang đăng nhập mà không hiển thị gì
    if (action === 'accept') {
      handleAcceptInvitation();
    } else {
      handleInvitationResponse();
    }
  }, [token, action]);

  const handleAcceptInvitation = async () => {
    // Không set loading = false để tránh hiển thị UI
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/respond?token=${token}&action=accept`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      // Lưu thông tin invitation vào sessionStorage
      sessionStorage.setItem('pendingInvitation', JSON.stringify({
        token,
        projectName: data.projectName,
        email: data.email
      }));
      
      // Chuyển thẳng đến trang đăng nhập ngay lập tức bằng window.location
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInvitationResponse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/invitations/respond?token=${token}&action=${action}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    // Lưu thông tin invitation vào sessionStorage để sử dụng sau khi đăng nhập
    sessionStorage.setItem('pendingInvitation', JSON.stringify({
      token,
      projectName: response?.projectName,
      email: response?.email
    }));
    navigate('/');
  };

  const goToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý phản hồi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goToHome}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        {action === 'accept' ? (
          <>
            <div className="text-blue-500 text-6xl mb-4">🔄</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang xử lý lời mời...</h2>
            <p className="text-gray-600 mb-6">
              Bạn sẽ được chuyển đến trang đăng nhập để hoàn tất việc tham gia dự án <strong>{response?.projectName}</strong>
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </>
        ) : (
          <>
            <div className="text-green-500 text-6xl mb-4">�</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cảm ơn bạn đã phản hồi!</h2>
            <p className="text-gray-600 mb-2">
              Bạn đã từ chối tham gia dự án <strong>{response?.projectName}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              Chủ dự án đã được thông báo về quyết định của bạn. Chúc bạn tìm được dự án phù hợp khác!
            </p>
            <button
              onClick={goToHome}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default InvitationResponsePage;
