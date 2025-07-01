import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectInvitation = sequelize.define('ProjectInvitation', {
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
    allowNull: false
  },
  inviterEmail: {
    type: DataTypes.STRING,
    references: {
      model: 'Users',
      key: 'email'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  inviteToken: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

export default ProjectInvitation;
