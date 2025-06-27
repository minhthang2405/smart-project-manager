import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <GoogleOAuthProvider clientId="229232632967-lar4bksa1grkrnkuti8uv4gnirrul9g6.apps.googleusercontent.com">
        <div className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl mb-4 font-bold text-center text-indigo-700">Đăng nhập bằng Google</h1>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("✅ Google User:", decoded);

              // Gửi token tới backend để xác thực
              fetch("http://localhost:5000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log("📦 Server response:", data);
                  onLogin(data.user);
                });
            }}
            onError={() => {
              console.log("❌ Đăng nhập thất bại");
            }}
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default LoginPage;
