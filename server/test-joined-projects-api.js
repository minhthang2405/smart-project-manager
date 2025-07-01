// Test APIs cho joined projects và tasks
const testEmail = 'thanglx19021@gmail.com';

async function testJoinedProjectsAPI() {
  try {
    console.log('🧪 Testing Joined Projects API...');
    
    // 1. Test get joined projects
    console.log('📋 Testing get joined projects...');
    const projectsRes = await fetch(`http://localhost:5000/projects/joined/${encodeURIComponent(testEmail)}`);
    
    if (!projectsRes.ok) {
      console.error('❌ Get projects failed:', projectsRes.status, await projectsRes.text());
      return;
    }
    
    const projects = await projectsRes.json();
    console.log('✅ Joined projects:', projects);
    
    // 2. Test get project stats
    console.log('📊 Testing get project stats...');
    const statsRes = await fetch(`http://localhost:5000/projects/stats/${encodeURIComponent(testEmail)}`);
    
    if (!statsRes.ok) {
      console.error('❌ Get stats failed:', statsRes.status, await statsRes.text());
      return;
    }
    
    const stats = await statsRes.json();
    console.log('✅ Project stats:', stats);
    
    // 3. Test get task stats
    console.log('📝 Testing get task stats...');
    const taskStatsRes = await fetch(`http://localhost:5000/tasks/stats/${encodeURIComponent(testEmail)}`);
    
    if (!taskStatsRes.ok) {
      console.error('❌ Get task stats failed:', taskStatsRes.status, await taskStatsRes.text());
      return;
    }
    
    const taskStats = await taskStatsRes.json();
    console.log('✅ Task stats:', taskStats);
    
    // 4. Test get tasks by project (nếu có project)
    if (projects.length > 0) {
      const projectId = projects[0].id;
      console.log(`📝 Testing get tasks for project ${projectId}...`);
      
      const tasksRes = await fetch(`http://localhost:5000/projects/${projectId}/tasks/${encodeURIComponent(testEmail)}`);
      
      if (!tasksRes.ok) {
        console.error('❌ Get project tasks failed:', tasksRes.status, await tasksRes.text());
        return;
      }
      
      const tasks = await tasksRes.json();
      console.log('✅ Project tasks:', tasks);
    }
    
    console.log('🎉 All APIs working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testJoinedProjectsAPI();
