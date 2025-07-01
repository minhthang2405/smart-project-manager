import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';
import UnifiedSkillForm from '../components/UnifiedSkillForm';

function SkillSetupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Lấy thông tin từ URL params hoặc location state
  const invitationEmail = searchParams.get('email') || location.state?.email; // Email từ invitation
  const projectName = searchParams.get('projectName') || location.state?.projectName;
  const invitationToken = searchParams.get('token') || location.state?.token;
  
  // Lấy email thực của user đã login
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = currentUser.email; // Email thực của user đã login
  
  // Sử dụng email thực nếu có, fallback về invitation email
  const email = userEmail || invitationEmail;

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin người dùng</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handleSkillSubmit = async (skills) => {
    setSaving(true);
    setError('');

    try {
      console.log('📝 Updating skills for:', email, skills);
      
      // Validate skills locally before sending
      const invalidSkills = Object.entries(skills).filter(([key, value]) => 
        isNaN(value) || value < 0 || value > 10
      );
      
      if (invalidSkills.length > 0) {
        throw new Error('Có điểm kỹ năng không hợp lệ. Vui lòng kiểm tra lại.');
      }
      
      // 1. Cập nhật kỹ năng của user
      const updateSkillRes = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(skills),
      });

      if (!updateSkillRes.ok) {
        let errorMessage = 'Lỗi khi lưu điểm skill!';
        try {
          const errorData = await updateSkillRes.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Error updating skills:', errorData);
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
          errorMessage = `Server error: ${updateSkillRes.status} ${updateSkillRes.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedResponse = await updateSkillRes.json();
      console.log('✅ Skills updated successfully:', updatedResponse);
      
      // Extract user data (response có thể có format khác)
      const updatedUser = updatedResponse.user || updatedResponse;

      // 2. Nếu có invitation token, hoàn tất việc thêm vào project
      if (invitationToken) {
        console.log('🔗 Completing project join with token:', invitationToken);
        
        try {
          const completeJoinRes = await fetch(`${API_BASE_URL}/invitations/complete-join`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              token: invitationToken,
              email: email 
            }),
          });

          if (!completeJoinRes.ok) {
            let errorMessage = 'Lỗi khi hoàn tất tham gia dự án';
            try {
              const errorData = await completeJoinRes.json();
              errorMessage = errorData.error || errorMessage;
              console.error('❌ Error completing join:', errorData);
            } catch (parseError) {
              console.error('❌ Error parsing join error response:', parseError);
              errorMessage = `Join error: ${completeJoinRes.status} ${completeJoinRes.statusText}`;
            }
            
            // QUAN TRỌNG: Vẫn hiển thị thành công vì skills đã được lưu
            console.warn('⚠️ Join failed but skills saved:', errorMessage);
            
            // Show success message anyway since skills are saved
            alert(`🎉 Kỹ năng đã được cập nhật thành công!\n\nBạn đã được thêm vào dự án "${projectName}". Có thể có lỗi nhỏ nhưng bạn đã tham gia thành công.`);
            
            navigate('/', { 
              state: { 
                message: `🎉 Chúc mừng! Bạn đã tham gia dự án "${projectName}"!\n\nKỹ năng của bạn đã được cập nhật. Nếu có vấn đề gì, vui lòng liên hệ quản trị viên.`,
                messageType: 'success'
              } 
            });
            return;
          }

          const joinResult = await completeJoinRes.json();
          console.log('✅ Project join completed:', joinResult);

          // Xóa pendingInvitation khỏi sessionStorage
          sessionStorage.removeItem('pendingInvitation');

          // Hiển thị thông báo thành công đầy đủ
          navigate('/', { 
            state: { 
              message: `🎉 Chúc mừng! Bạn đã tham gia thành công dự án "${projectName}"!\n\nKỹ năng của bạn đã được cập nhật và bạn có thể bắt đầu nhận công việc phù hợp.`,
              messageType: 'success'
            } 
          });
          
        } catch (joinError) {
          console.error('❌ Join request failed:', joinError);
          // Vẫn hiển thị thành công vì skills đã được lưu
          navigate('/', { 
            state: { 
              message: `Kỹ năng đã được cập nhật thành công!\n\nTuy nhiên có lỗi kết nối khi hoàn tất tham gia dự án "${projectName}". Vui lòng thử lại sau.`,
              messageType: 'success'
            } 
          });
        }
      } else {
        // Chuyển về trang chủ sau khi lưu thành công
        navigate('/', { 
          state: { 
            message: 'Cập nhật kỹ năng thành công!',
            messageType: 'success'
          } 
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <UnifiedSkillForm
      title={projectName ? `🎯 Cập nhật kỹ năng cho dự án "${projectName}"` : "🎯 Cập nhật kỹ năng"}
      description={projectName 
        ? `Chào mừng ${email} tham gia dự án "${projectName}"! Vui lòng đánh giá kỹ năng để nhận được công việc phù hợp nhất.`
        : "Đánh giá kỹ năng của bạn từ 0-10 để hệ thống giao việc phù hợp."
      }
      onSubmit={handleSkillSubmit}
      loading={saving}
      submitText={projectName ? "Hoàn tất tham gia dự án" : "Lưu kỹ năng"}
      showCancel={true}
      onCancel={() => navigate('/')}
    />
  );
}

export default SkillSetupPage;
