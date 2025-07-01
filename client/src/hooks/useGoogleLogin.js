// useGoogleLogin.js - Custom hook xử lý đăng nhập Google
import { useState } from "react";
import { API_BASE_URL } from '../config/api.js';

export function useGoogleLogin(onLogin) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleLogin = async (credential) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi xác thực Google");
            
            // Sau khi đăng nhập thành công, kiểm tra pendingInvitation
            const pendingInvitation = sessionStorage.getItem('pendingInvitation');
            if (pendingInvitation) {
                try {
                    const invitationData = JSON.parse(pendingInvitation);
                    // Truyền thông tin invitation cho onLogin
                    onLogin(data.user, invitationData);
                } catch (e) {
                    console.error('Error parsing pendingInvitation:', e);
                    onLogin(data.user);
                }
            } else {
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return { handleGoogleLogin, loading, error };
}
