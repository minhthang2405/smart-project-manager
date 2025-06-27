import React, { useState, useEffect } from "react";
import { getUserByEmail } from "../services/user.service";

const Header = ({ user, onLogout }) => {
    const [userSkillOk, setUserSkillOk] = useState(false);
    useEffect(() => {
        if (user) {
            getUserByEmail(user.email)
                .then(data => {
                    const ok = SKILL_FIELDS.every(f => typeof data[f] === 'number' && data[f] > 0);
                    setUserSkillOk(ok);
                })
                .catch(() => setUserSkillOk(false));
        }
    }, [user]);

    return (
        <header className="header bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg py-4 px-8 flex items-center justify-between animate-fade-in-down">
            <div className="header-logo flex items-center gap-3">
                <a href={user ? "/" : undefined} className="flex items-center gap-3">
                    <span className="header-title text-white text-2xl font-bold tracking-wide"> 🤖 Smart Project Management</span>
                </a>
            </div>
            <nav className="header-nav space-x-6 flex items-center">
                {user ? (
                    <>
                        <span className="text-white font-medium">👋 Xin chào, <span className="font-bold">{user.email}</span></span>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-semibold transition-colors duration-200"
                        >
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <a
                        href="/login"
                        className="text-white hover:text-yellow-300 transition-colors duration-300 font-medium"
                    >
                        Đăng nhập
                    </a>
                )}
            </nav>
        </header>
    );
};

export default Header;