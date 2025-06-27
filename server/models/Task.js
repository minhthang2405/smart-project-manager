import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  estimatedTime: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Chưa hoàn thành' },
  assignee: {
    type: DataTypes.STRING,
    references: {
      model: 'Users',
      key: 'email'
    }
  },
  projectId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  deadline: DataTypes.DATE,
  completedAt: DataTypes.DATE,
});

export default Task;