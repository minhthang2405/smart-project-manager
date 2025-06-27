// src/pages/RegisterPage.jsx
import { useState } from "react";

export default function RegisterPage({ onRegister, switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("leader");

  const handleRegister = (e) => {
    e.preventDefault();
    onRegister({ email, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-200">
      <form className="bg-white p-6 rounded-xl shadow-md w-96" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-800">📝 Đăng ký</h2>
        <input
          type="email"
          className="input mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="input mb-3"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="input mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="leader">👑 Leader</option>
          <option value="member">🙋 Member</option>
        </select>
        <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Đăng ký
        </button>
        <p className="mt-4 text-center text-sm">
          Đã có tài khoản?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={switchToLogin}
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}
