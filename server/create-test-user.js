// Create test user manually
import User from './models/User.js';
import sequelize from './config/db.js';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('📊 Database connected');
    
    const testUser = await User.create({
      email: 'thanglx19021@gmail.com',
      name: 'Test User',
      avatar: 'test-avatar.jpg',
      frontend: 1,
      backend: 1,
      ai: 1,
      devops: 1,
      mobile: 1,
      uxui: 1,
      testing: 1,
      management: 1,
    });
    
    console.log('✅ Test user created:', testUser.toJSON());
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser();
