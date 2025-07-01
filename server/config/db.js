import { Sequelize } from 'sequelize';

// Use DATABASE_URL or MYSQL_URL if available (Railway, Heroku) or fallback to individual config
let sequelize;

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (dbUrl) {
  // Production: Use DATABASE_URL or MYSQL_URL (Railway, Heroku)
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
      // Remove SSL for Railway internal connections
      // SSL causes connection issues on Railway
    }
  });
} else {
  // Development: Use individual config
  sequelize = new Sequelize(
    process.env.DB_NAME || 'smartpm',
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      port: process.env.DB_PORT || 3306,
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

export default sequelize;
