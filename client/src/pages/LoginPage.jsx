import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "../hooks/useGoogleLogin";

function LoginPage({ onLogin }) {
  const { handleGoogleLogin, loading, error } = useGoogleLogin(onLogin);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 w-full">
      <GoogleOAuthProvider clientId="229232632967-lar4bksa1grkrnkuti8uv4gnirrul9g6.apps.googleusercontent.com">
        <div className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl mb-4 font-bold text-center text-indigo-700">Đăng nhập bằng Google</h1>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("✅ Google User:", decoded);
              handleGoogleLogin(credentialResponse.credential);
            }}
            onError={() => {
              console.log("❌ Đăng nhập thất bại");
            }}
          />
          {loading && <div className="text-gray-500 mt-2">Đang xác thực...</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default LoginPage;
