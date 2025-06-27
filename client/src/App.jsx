// src/App.jsx
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showSkillForm, setShowSkillForm] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
      setShowSkillForm(false);
    }
  }, [user]);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    setShowSkillForm(false);
  };

  const handleEditSkill = () => {
    setShowSkillForm(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={handleLogout} onEditSkill={handleEditSkill} />
      <main className="flex-1 flex flex-col items-center justify-center">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Dashboard user={user} showSkillForm={showSkillForm} setShowSkillForm={setShowSkillForm} />
        )}
      </main>
      <Footer />
    </div>
  );
}
