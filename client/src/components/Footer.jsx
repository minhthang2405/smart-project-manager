import React from "react";

const Footer = () => (
    <footer className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white py-4 px-8 mt-10 shadow-inner animate-fadeInUp">
        <div className="flex flex-col md:flex-row items-center justify-between">
            <span className="font-semibold">© {new Date().getFullYear()} Smart Project Management</span>
            <div className="flex gap-4 mt-2 md:mt-0">
                <a href="#" className="hover:text-yellow-300 transition-colors duration-300">Chính sách bảo mật</a>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-300">Liên hệ</a>
            </div>
        </div>
    </footer>
);

export default Footer;
