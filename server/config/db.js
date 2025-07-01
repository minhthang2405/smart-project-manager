import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('smartpm', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: console.log, // Để debug SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
