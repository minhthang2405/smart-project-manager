// Test tạo task để kiểm tra lỗi
const testEmail = 'thanglx19021@gmail.com';

async function testCreateTask() {
  try {
    console.log('🧪 Testing Create Task API...');
    
    // 1. Tạo project test trước
    console.log('📋 Creating test project...');
    const projectRes = await fetch('http://localhost:5000/projects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Project for Tasks',
        owner: testEmail
      })
    });
    
    if (!projectRes.ok) {
      console.error('❌ Create project failed:', projectRes.status, await projectRes.text());
      return;
    }
    
    const project = await projectRes.json();
    console.log('✅ Project created:', project.id, project.name);
    
    // 2. Thêm member vào project (chính user này)
    console.log('👥 Adding member to project...');
    const memberRes = await fetch(`http://localhost:5000/projects/${project.id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    if (memberRes.ok) {
      console.log('✅ Member added or already exists');
    } else {
      console.log('⚠️ Member add result:', memberRes.status, await memberRes.text());
    }
    
    // 3. Tạo task
    console.log('📝 Creating task...');
    const taskData = {
      title: 'Test Task',
      difficulty: 'Trung bình',
      estimatedTime: '2 giờ',
      assignee: testEmail,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 ngày sau
    };
    
    console.log('Task data:', taskData);
    
    const taskRes = await fetch(`http://localhost:5000/projects/${project.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!taskRes.ok) {
      const errorText = await taskRes.text();
      console.error('❌ Create task failed:', taskRes.status, errorText);
      return;
    }
    
    const task = await taskRes.json();
    console.log('✅ Task created successfully:', task);
    
    console.log('🎉 Create task test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCreateTask();
