import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Database Connection Debugging Tool');
console.log('====================================');

// Check all possible database environment variables
console.log('\n📊 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (hidden for security)' : 'NOT SET');
console.log('MYSQL_URL:', process.env.MYSQL_URL ? 'SET (hidden for security)' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST || 'not set');
console.log('DB_PORT:', process.env.DB_PORT || 'not set');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET (hidden)' : 'NOT SET');

// Railway specific variables
console.log('\n🚂 Railway Variables (if any):');
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'not set');
console.log('RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID || 'not set');

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (dbUrl) {
    console.log('\n🔗 Using connection URL (DATABASE_URL or MYSQL_URL)');
    
    // Parse URL to show components (mask password)
    try {
        const url = new URL(dbUrl);
        console.log('Protocol:', url.protocol);
        console.log('Host:', url.hostname);
        console.log('Port:', url.port || 'default');
        console.log('Database:', url.pathname.replace('/', ''));
        console.log('Username:', url.username);
        console.log('Password:', url.password ? '***masked***' : 'not set');
        
        // Test different connection configurations
        console.log('\n🧪 Testing connection configurations...');
        
        // Test 1: Direct URL with minimal options
        console.log('\n Test 1: Direct URL connection');
        try {
            const sequelize1 = new Sequelize(dbUrl, {
                dialect: 'mysql',
                logging: false,
                pool: { max: 1, min: 0, acquire: 10000, idle: 10000 }
            });
            
            await sequelize1.authenticate();
            console.log('✅ Test 1 SUCCESS: Direct URL connection works!');
            await sequelize1.close();
        } catch (error) {
            console.log('❌ Test 1 FAILED:', error.message);
        }
        
        // Test 2: URL with SSL disabled
        console.log('\n Test 2: URL with SSL disabled');
        try {
            const sequelize2 = new Sequelize(dbUrl, {
                dialect: 'mysql',
                logging: false,
                pool: { max: 1, min: 0, acquire: 10000, idle: 10000 },
                dialectOptions: {
                    ssl: false
                }
            });
            
            await sequelize2.authenticate();
            console.log('✅ Test 2 SUCCESS: SSL disabled connection works!');
            await sequelize2.close();
        } catch (error) {
            console.log('❌ Test 2 FAILED:', error.message);
        }
        
        // Test 3: URL with extended timeout
        console.log('\n Test 3: URL with extended timeout');
        try {
            const sequelize3 = new Sequelize(dbUrl, {
                dialect: 'mysql',
                logging: false,
                pool: { max: 1, min: 0, acquire: 30000, idle: 10000 },
                dialectOptions: {
                    connectTimeout: 60000,
                    acquireTimeout: 60000,
                    timeout: 60000
                }
            });
            
            await sequelize3.authenticate();
            console.log('✅ Test 3 SUCCESS: Extended timeout connection works!');
            await sequelize3.close();
        } catch (error) {
            console.log('❌ Test 3 FAILED:', error.message);
        }
        
        // Test 4: Manual configuration from parsed URL
        console.log('\n Test 4: Manual configuration from parsed URL');
        try {
            const sequelize4 = new Sequelize(
                url.pathname.replace('/', ''), // database name
                url.username, // username
                url.password, // password
                {
                    host: url.hostname,
                    port: url.port || 3306,
                    dialect: 'mysql',
                    logging: false,
                    pool: { max: 1, min: 0, acquire: 10000, idle: 10000 }
                }
            );
            
            await sequelize4.authenticate();
            console.log('✅ Test 4 SUCCESS: Manual configuration works!');
            await sequelize4.close();
        } catch (error) {
            console.log('❌ Test 4 FAILED:', error.message);
        }
        
    } catch (parseError) {
        console.log('❌ Failed to parse DATABASE_URL:', parseError.message);
    }
} else {
    console.log('\n⚠️ No DATABASE_URL or MYSQL_URL found');
    console.log('Will try individual environment variables...');
    
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 3306;
    const database = process.env.DB_NAME || 'smartpm';
    const username = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    
    console.log('\n🧪 Testing individual config...');
    try {
        const sequelize = new Sequelize(database, username, password, {
            host: host,
            port: port,
            dialect: 'mysql',
            logging: false,
            pool: { max: 1, min: 0, acquire: 10000, idle: 10000 }
        });
        
        await sequelize.authenticate();
        console.log('✅ Individual config connection works!');
        await sequelize.close();
    } catch (error) {
        console.log('❌ Individual config FAILED:', error.message);
    }
}

console.log('\n🏁 Debug complete');
process.exit(0);
