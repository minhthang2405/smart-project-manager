import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import userRoutes from './routes/user.routes.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

sequelize.sync();

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/users', userRoutes);

app.listen(5000, () => console.log('🚀 Server chạy ở http://localhost:5000'));
