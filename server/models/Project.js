import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  owner: {
    type: DataTypes.STRING,
    references: {
      model: 'Users',
      key: 'email'
    }
  }
});

export default Project;