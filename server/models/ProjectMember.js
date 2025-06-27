import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    references: {
      model: 'Users',
      key: 'email'
    }
  }
});

export default ProjectMember;