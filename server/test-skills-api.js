// Test script để kiểm tra API cập nhật skills
// Sử dụng built-in fetch thay vì node-fetch
const testEmail = 'thanglx19021@gmail.com'; // Sử dụng email thật đã có trong DB
const testSkills = {
  frontend: 8,
  backend: 7,
  ai: 5,
  devops: 6,
  mobile: 4,
  uxui: 7,
  testing: 6,
  management: 5
};

async function testUpdateSkills() {
  try {
    console.log('🧪 Testing skills update API...');
    
    // Skip tạo user vì đã có trong DB
    console.log('📝 Testing skills update for:', testEmail);
    console.log('Skills to update:', testSkills);
    
    const updateRes = await fetch(`http://localhost:5000/users/${encodeURIComponent(testEmail)}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testSkills)
    });
    
    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('❌ Update failed:', updateRes.status, errorText);
      return;
    }
    
    const updatedUser = await updateRes.json();
    console.log('✅ Skills updated successfully!');
    console.log('Updated user:', updatedUser);
    
    // 3. Verify update
    const getUserRes = await fetch(`http://localhost:5000/users/${encodeURIComponent(testEmail)}`);
    if (getUserRes.ok) {
      const user = await getUserRes.json();
      console.log('🔍 Verified user data:', user);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpdateSkills();
