// src/App.jsx
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [mode, setMode] = useState("login"); // "login", "register"

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const handleLogin = (userInfo) => {
    // Gọi API xác thực thật sau
    setUser(userInfo);
  };

  const handleRegister = (userInfo) => {
    // Gọi API tạo tài khoản thật sau
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  if (!user) {
    if (mode === "login") {
      return (
        <LoginPage
          onLogin={handleLogin}
          switchToRegister={() => setMode("register")}
        />
      );
    } else {
      return (
        <RegisterPage
          onRegister={handleRegister}
          switchToLogin={() => setMode("login")}
        />
      );
    }
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
