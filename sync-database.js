// Sync production database to local
import mysql from 'mysql2/promise';

const prodConfig = {
    host: 'gondola.proxy.rlwy.net',
    user: 'root',
    password: 'elLptjkIlraIPyKAHTZtMMEIdZELxtxk',
    database: 'railway',
    port: 29172
};

const localConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // your local MySQL password
    database: 'smartpm', // your local database name
    port: 3306
};

const syncDatabase = async () => {
    let prodConnection, localConnection;
    
    try {
        console.log('🔄 Connecting to Railway database...');
        prodConnection = await mysql.createConnection(prodConfig);
        
        console.log('🔄 Connecting to local database...');
        localConnection = await mysql.createConnection(localConfig);
        
        // Get all tables from production
        console.log('📋 Getting table list...');
        const [tables] = await prodConnection.execute(`
            SELECT TABLE_NAME as table_name
            FROM information_schema.tables 
            WHERE table_schema = 'railway' 
            AND table_type = 'BASE TABLE'
        `);
        
        console.log(`Found ${tables.length} tables:`, tables.map(t => t.table_name));
        
        // Sync in correct order to handle foreign key constraints
        const syncOrder = ['Users', 'Projects', 'ProjectMembers', 'ProjectInvitations', 'Tasks'];
        const availableTables = tables.map(t => t.table_name);
        const tablesToSync = syncOrder.filter(table => availableTables.includes(table));
        
        console.log('📋 Sync order:', tablesToSync);
        
        // Disable foreign key checks temporarily
        await localConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const tableName of tablesToSync) {
            console.log(`\n📊 Syncing table: ${tableName}`);
            
            try {
                // Check if table exists in local, if not create it
                const [localTables] = await localConnection.execute(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'smartpm' 
                    AND table_name = ?
                `, [tableName]);
                
                if (localTables.length === 0) {
                    console.log(`  � Creating table ${tableName} in local database...`);
                    // Get CREATE TABLE statement from production
                    const [createStmt] = await prodConnection.execute(`SHOW CREATE TABLE ${tableName}`);
                    let createQuery = createStmt[0]['Create Table'];
                    // Replace database name references
                    createQuery = createQuery.replace(/`railway`\./g, '`smartpm`.');
                    await localConnection.execute(createQuery);
                    console.log(`  ✅ Created table ${tableName}`);
                }
                
                // Clear local table
                await localConnection.execute(`DELETE FROM ${tableName}`);
                console.log(`  🗑️ Cleared local ${tableName}`);
                
                // Get data from production
                const [rows] = await prodConnection.execute(`SELECT * FROM ${tableName}`);
                console.log(`  📥 Found ${rows.length} records in production`);
                
                if (rows.length > 0) {
                    // Get column names
                    const columns = Object.keys(rows[0]);
                    const placeholders = columns.map(() => '?').join(', ');
                    const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                    
                    // Insert data to local
                    for (const row of rows) {
                        const values = columns.map(col => row[col]);
                        await localConnection.execute(insertQuery, values);
                    }
                    console.log(`  ✅ Inserted ${rows.length} records to local`);
                } else {
                    console.log(`  ℹ️ No data to sync for ${tableName}`);
                }
                
            } catch (tableError) {
                console.error(`  ❌ Error syncing table ${tableName}:`, tableError.message);
            }
        }
        
        // Re-enable foreign key checks
        await localConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('\n✅ Database sync completed!');
        
    } catch (error) {
        console.error('❌ Sync error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (prodConnection) {
            await prodConnection.end();
            console.log('🔌 Closed production connection');
        }
        if (localConnection) {
            await localConnection.end();
            console.log('🔌 Closed local connection');
        }
    }
};

syncDatabase();
