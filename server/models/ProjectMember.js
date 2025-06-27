import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: DataTypes.INTEGER,
  email: DataTypes.STRING,
});

export default ProjectMember; 