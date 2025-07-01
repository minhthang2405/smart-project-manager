# Smart Project Management - Deployment Guide

## 📋 Tổng quan

Dự án Smart Project Management gồm 2 phần chính:
- **Server (Backend)**: Node.js + Express + Sequelize + MySQL
- **Client (Frontend)**: React + Vite + TailwindCSS

## 🚀 Deployment Options

### Option 1: Railway (Khuyến nghị - Free + Easy)

#### **Deploy Server lên Railway**

1. **Chuẩn bị**:
   ```bash
   # Tạo tài khoản tại https://railway.app
   # Kết nối GitHub account
   ```

2. **Setup Database**:
   - Trong Railway dashboard, tạo MySQL database
   - Copy connection URL từ Railway

3. **Deploy Server**:
   - Push code lên GitHub repository
   - Trong Railway: New Project → Deploy from GitHub
   - Chọn repository và folder `server`
   - Thêm Environment Variables:
     ```
     DATABASE_URL=mysql://user:password@hostname:port/database
     EMAIL=your-email@gmail.com
     PASSWORD=your-app-password
     NODE_ENV=production
     CLIENT_URL=https://your-client-domain.vercel.app
     ```

4. **Configure**:
   - Railway sẽ tự detect Node.js và run `npm start`
   - Domain sẽ được generate tự động

#### **Deploy Client lên Vercel**

1. **Chuẩn bị**:
   ```bash
   # Tạo tài khoản tại https://vercel.com
   # Kết nối GitHub account
   ```

2. **Deploy**:
   - Trong Vercel: New Project → Import từ GitHub
   - Chọn repository và folder `client`
   - Framework preset: Vite
   - Environment Variables:
     ```
     VITE_API_URL=https://your-railway-server-domain.railway.app
     ```

3. **Configure**:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

---

### Option 2: Heroku + Netlify

#### **Deploy Server lên Heroku**

1. **Setup**:
   ```bash
   npm install -g heroku
   heroku login
   cd server
   git init
   heroku create your-app-name
   ```

2. **Configure Database**:
   ```bash
   heroku addons:create cleardb:ignite
   heroku config:get CLEARDB_DATABASE_URL
   # Copy URL and set as DATABASE_URL
   ```

3. **Environment Variables**:
   ```bash
   heroku config:set EMAIL=your-email@gmail.com
   heroku config:set PASSWORD=your-app-password
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app.netlify.app
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### **Deploy Client lên Netlify**

1. **Build locally**:
   ```bash
   cd client
   # Tạo file .env.production
   echo "VITE_API_URL=https://your-heroku-app.herokuapp.com" > .env.production
   npm run build
   ```

2. **Deploy**:
   - Vào https://netlify.com
   - Drag & drop folder `dist` vào Netlify
   - Hoặc connect với GitHub để auto-deploy

---

### Option 3: VPS (Advanced)

#### **Setup Server trên VPS**

1. **Install Dependencies**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm mysql-server nginx
   
   # Clone repository
   git clone https://github.com/your-username/smart-manager.git
   cd smart-manager/server
   npm install
   ```

2. **Setup Database**:
   ```bash
   sudo mysql_secure_installation
   mysql -u root -p
   CREATE DATABASE smartpm;
   CREATE USER 'smartpm_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON smartpm.* TO 'smartpm_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env với database credentials
   npm run init-db
   ```

4. **Setup PM2**:
   ```bash
   npm install -g pm2
   pm2 start app.js --name "smart-manager-api"
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location / {
           root /var/www/smart-manager-client;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## 🔧 Environment Variables

### Server (.env)
```env
# Database
DATABASE_URL=mysql://username:password@host:port/database

# Email (for sending invitations)
EMAIL=your-email@gmail.com
PASSWORD=your-app-password

# Environment
NODE_ENV=production

# CORS
CLIENT_URL=https://your-client-domain.com

# Optional: JWT Secret
JWT_SECRET=your-super-secret-key
```

### Client (.env.production)
```env
# API URL
VITE_API_URL=https://your-api-domain.com
```

---

## 📝 Pre-deployment Checklist

### Server
- [ ] Database connection tested
- [ ] Email service configured
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Database initialized (`npm run init-db`)
- [ ] All APIs tested

### Client
- [ ] API URL configured correctly
- [ ] Build process successful (`npm run build`)
- [ ] No hardcoded URLs
- [ ] Environment variables set
- [ ] Routing configured for SPA

---

## 🧪 Testing Deployment

### API Health Check
```bash
curl https://your-api-domain.com/health
# Expected: {"status": "OK", "database": "connected"}
```

### Client Health Check
```bash
curl https://your-client-domain.com
# Expected: HTML content loads
```

### Full E2E Test
1. Register new user
2. Create project
3. Invite member
4. Assign task
5. Update task status
6. Check notifications

---

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
mysql://username:password@host:port/database_name

# Test connection
npm run init-db
```

**CORS Errors**
```javascript
// server/app.js - ensure CLIENT_URL is correct
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Email Not Sending**
- Check Gmail App Password
- Verify EMAIL and PASSWORD env vars
- Check firewall/port 587

---

## 📈 Production Optimizations

### Performance
- Enable gzip compression
- Use CDN for static assets
- Implement Redis caching
- Database query optimization

### Security
- Use HTTPS only
- Implement rate limiting
- Sanitize user inputs
- Regular security updates

### Monitoring
- Setup error tracking (Sentry)
- Monitor API performance
- Database monitoring
- Uptime monitoring

---

## 🆘 Support

Nếu gặp vấn đề trong quá trình deploy:

1. Check logs:
   ```bash
   # Railway: View logs in dashboard
   # Heroku: heroku logs --tail
   # VPS: pm2 logs
   ```

2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity
5. Verify CORS configuration

---

## 📞 Contact

- GitHub Issues: [Create issue](https://github.com/your-username/smart-manager/issues)
- Email: your-email@example.com

---

*Last updated: July 2025*
