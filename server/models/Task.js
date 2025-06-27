import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  estimatedTime: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Chưa hoàn thành' },
  assignee: DataTypes.STRING, // email người nhận task
  projectId: DataTypes.INTEGER,
  deadline: DataTypes.DATE, // thời hạn hoàn thành
  completedAt: DataTypes.DATE, // thời điểm hoàn thành
});

export default Task; 