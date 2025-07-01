// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import InvitationResponsePage from "./pages/InvitationResponsePage";
import SkillSetupPage from "./pages/SkillSetupPage";

function AppContent() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [message, setMessage] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
      setShowSkillForm(false);
    }

    // Kiểm tra message từ navigation state
    if (location.state?.message) {
      setMessage({
        text: location.state.message,
        type: location.state.messageType || 'info'
      });
      
      // Xóa message sau 8 giây (thời gian đủ để đọc)
      setTimeout(() => {
        setMessage(null);
      }, 8000);

      // Xóa state để tránh hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [user, location.state]);

  const handleLogin = (userInfo, invitationData = null) => {
    setUser(userInfo);
    if (invitationData) {
      setPendingInvitation(invitationData);
      // Chuyển đến trang cập nhật kỹ năng với thông tin invitation
      setTimeout(() => {
        window.location.href = `/skill-setup?email=${encodeURIComponent(invitationData.email)}&projectName=${encodeURIComponent(invitationData.projectName)}&token=${encodeURIComponent(invitationData.token)}`;
      }, 100);
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("pendingInvitation");
    setShowSkillForm(false);
    setPendingInvitation(null);
  };

  const handleEditSkill = () => {
    setShowSkillForm(true);
  };

  // Không hiển thị header/footer cho các trang invitation và skill-setup
  const hideHeaderFooter = location.pathname.includes('/invitation') || location.pathname.includes('/skill-setup');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideHeaderFooter && <Header user={user} onLogout={handleLogout} onEditSkill={handleEditSkill} />}
      
      {/* Hiển thị thông báo */}
      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white p-8 rounded-xl shadow-2xl max-w-md mx-4 ${
            message.type === 'success' ? 'border-l-4 border-green-500' :
            message.type === 'error' ? 'border-l-4 border-red-500' :
            'border-l-4 border-blue-500'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.type === 'success' && (
                  <div className="text-green-500 text-4xl mb-4">🎉</div>
                )}
                {message.type === 'error' && (
                  <div className="text-red-500 text-4xl mb-4">❌</div>
                )}
                {message.type !== 'success' && message.type !== 'error' && (
                  <div className="text-blue-500 text-4xl mb-4">ℹ️</div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message.type === 'success' ? 'Thành công!' :
                   message.type === 'error' ? 'Có lỗi xảy ra!' :
                   'Thông báo'}
                </h3>
                <div className="text-gray-600 text-sm leading-relaxed">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setMessage(null)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  message.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  message.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center">
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? (
                <LoginPage onLogin={handleLogin} />
              ) : (
                <Dashboard user={user} showSkillForm={showSkillForm} setShowSkillForm={setShowSkillForm} />
              )
            } 
          />
          <Route path="/invitation" element={<InvitationResponsePage />} />
          <Route path="/skill-setup" element={<SkillSetupPage />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
