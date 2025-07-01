# Smart Project Management

## Giới thiệu

Smart Project Management là một ứng dụng quản lý dự án thông minh cho phép người dùng tạo, quản lý dự án và phân công công việc dựa trên kỹ năng của các thành viên. Hệ thống hỗ trợ đề xuất thành viên phù hợp nhất cho từng task dựa trên điểm kỹ năng cá nhân, giúp tối ưu hóa quá trình phân công và nâng cao hiệu quả làm việc nhóm.

## Tính năng chính

- **Quản lý tài khoản**:
  - Đăng ký, đăng nhập với Google OAuth
  - Tự đánh giá điểm kỹ năng cá nhân (frontend, backend, AI, DevOps, mobile, UX/UI, testing, management)
  - Cập nhật kỹ năng linh hoạt

- **Quản lý dự án**:
  - Tạo dự án mới với giao diện thân thiện
  - Gửi lời mời thành viên qua email
  - Quản lý trạng thái lời mời (pending, accepted, declined)
  - Xem danh sách thành viên và quyền hạn

- **Phân công công việc thông minh**:
  - Tạo task với thông tin chi tiết (tên, mô tả, kỹ năng yêu cầu, độ khó, thời gian ước tính, deadline)
  - **Smart Task Assignment**: AI đề xuất người thực hiện phù hợp nhất dựa trên điểm kỹ năng
  - Gửi email thông báo tự động khi được giao task

- **Theo dõi công việc**:
  - **Assigned Tasks Manager**: Xem tất cả task đã giao với bộ lọc theo dự án, trạng thái, độ khó
  - **Member Dashboard**: Xem task được giao và cập nhật trạng thái
  - Thống kê tiến độ và thông báo task chưa hoàn thành
  - Lịch sử hoàn thành công việc

- **Giao diện thân thiện**:
  - Responsive design với TailwindCSS
  - Dark/Light theme support
  - Notification system
  - Modern UI/UX với icons và animations

## Cài đặt

### Yêu cầu hệ thống

- Node.js (v14.0.0 trở lên)
- MySQL Database
- NPM hoặc Yarn
- Gmail account (để gửi email mời)

### Cài đặt và chạy ứng dụng

1. **Clone dự án**
   ```bash
   git clone https://github.com/yourusername/smart-project-management.git
   cd smart-project-management
   ```

2. **Cài đặt dependencies cho server**
   ```bash
   cd server
   npm install
   ```

3. **Cài đặt dependencies cho client**
   ```bash
   cd ../client
   npm install
   ```

4. **Cấu hình database và environment**
   ```bash
   # Trong thư mục server
   cp .env.example .env
   # Sửa file .env với thông tin database và email của bạn
   
   # Khởi tạo database
   npm run init-db
   ```

5. **Chạy ứng dụng**
   ```bash
   # Terminal 1: Chạy server
   cd server
   npm run dev
   
   # Terminal 2: Chạy client  
   cd client
   npm run dev
   ```

6. **Truy cập ứng dụng**
   - Client: http://localhost:3000
   - Server API: http://localhost:5000
   ```
   cd ../client
   npm install
   ```

4. **Cấu hình môi trường**
   - Tạo file `.env` trong thư mục server với các thông tin:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

5. **Chạy ứng dụng**

   - Chạy server:
   ```
   cd server
   npm start
   ```

   - Chạy client:
   ```
   cd client
   npm run dev
   ```

   Server sẽ chạy tại `http://localhost:5000` và client tại `http://localhost:5173`

   đổi file db.js như là port username password

## Hướng dẫn sử dụng

### 1. Đăng ký và đánh giá kỹ năng

1. Truy cập trang đăng ký và tạo tài khoản mới
2. Sau khi đăng nhập lần đầu, hệ thống sẽ yêu cầu bạn đánh giá kỹ năng (thang điểm 0-10)
3. Điền điểm số cho từng kỹ năng và nhấn "Lưu điểm kỹ năng"
4. Bạn có thể chỉnh sửa điểm kỹ năng bất kỳ lúc nào bằng nút "Chỉnh sửa điểm skill" trên dashboard

### 2. Tạo và quản lý dự án

1. Tại dashboard, nhập tên dự án vào ô và nhấn "Tạo dự án"
2. Dự án mới sẽ xuất hiện trong danh sách, với bạn là chủ dự án
3. Để thêm thành viên, nhấn "Quản lý thành viên"
4. Nhập email của thành viên và nhấn "Thêm"

### 3. Giao task thông minh

1. Chọn dự án bằng cách nhấn "Chọn để giao task"
2. Điền thông tin công việc: tên, kỹ năng chính, độ khó, thời gian dự kiến, deadline
3. Nhấn "Đề xuất người phù hợp" để nhận gợi ý
4. Hệ thống sẽ hiển thị người có điểm số cao nhất cho kỹ năng đó
5. Chọn người thực hiện từ dropdown và nhấn "Giao task"
6. Email thông báo sẽ được gửi đến người được giao task

### 4. Theo dõi công việc

1. Phần "Công việc của bạn" hiển thị các task đã được giao cho bạn
2. Phần "Công việc của thành viên" hiển thị các task bạn đã giao cho người khác
3. Bạn có thể cập nhật trạng thái các task này

## Cấu trúc dự án

```
smart-project-management/
├── client/               # Frontend code - React, Vite
│   ├── public/           # Public assets
│   ├── src/
│   │   ├── assets/       # Image assets
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   └── utils/        # Utility functions
│   ├── package.json
│   └── vite.config.js
│
└── server/               # Backend code - Node.js, Express
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── models/           # Mongoose models
    ├── routes/           # Express routes
    ├── services/         # Business logic
    ├── app.js            # Express app
    └── package.json
```

## Công nghệ sử dụng

- **Frontend**:
  - React (UI library)
  - Vite (Build tool)
  - TailwindCSS (Styling)
  - React Router (Routing)
  - Axios (API calls)

- **Backend**:
  - Node.js & Express (Server)
  - MySQL & Sequelize (Database)
  - JWT (Authentication)
  - Nodemailer (Email sending)
  - Google OAuth (Authentication)

## 🚀 Deployment

Để deploy ứng dụng lên production, vui lòng xem hướng dẫn chi tiết tại [DEPLOYMENT.md](./DEPLOYMENT.md).

**Tóm tắt nhanh:**
- **Server**: Railway, Heroku, hoặc VPS
- **Client**: Vercel, Netlify, hoặc static hosting
- **Database**: Railway MySQL, Heroku ClearDB, hoặc tự host

## Tính năng sẽ phát triển trong tương lai

- Thống kê và báo cáo dự án với biểu đồ trực quan
- Tích hợp với công cụ chat và trao đổi file
- Đánh giá hiệu suất thành viên sau khi hoàn thành task
- Tích hợp với các nền tảng CI/CD và quản lý mã nguồn
- Ứng dụng mobile cho iOS và Android
- Real-time notifications với WebSocket
- Advanced task dependency management
- Time tracking và reporting

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:
- Tạo [Issue](https://github.com/yourusername/smart-manager/issues) trên GitHub
- Email: support@smart-manager.com

## License

Dự án này được phân phối dưới giấy phép MIT License. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

© 2025 Smart Project Management Team
