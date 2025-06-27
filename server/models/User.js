import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  avatar: DataTypes.STRING,
  frontend: { type: DataTypes.INTEGER, defaultValue: 0 },
  backend: { type: DataTypes.INTEGER, defaultValue: 0 },
  ai: { type: DataTypes.INTEGER, defaultValue: 0 },
  devops: { type: DataTypes.INTEGER, defaultValue: 0 },
  mobile: { type: DataTypes.INTEGER, defaultValue: 0 },
  uxui: { type: DataTypes.INTEGER, defaultValue: 0 },
  testing: { type: DataTypes.INTEGER, defaultValue: 0 },
  management: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export default User; 