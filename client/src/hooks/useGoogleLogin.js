// useGoogleLogin.js - Custom hook xử lý đăng nhập Google
import { useState } from "react";

export function useGoogleLogin(onLogin) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleLogin = async (credential) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi xác thực Google");
            onLogin(data.user);
        } catch (err) {
            setError(err.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return { handleGoogleLogin, loading, error };
}
