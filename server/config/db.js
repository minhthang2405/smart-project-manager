import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('smartpm', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

export default sequelize;
