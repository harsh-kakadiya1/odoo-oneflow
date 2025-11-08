const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@designstudio.com',
      password: 'admin123'  // Default password from seed
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');

    // Test dashboard stats
    console.log('\n2. Testing dashboard stats...');
    const statsResponse = await axios.get(`${baseURL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard stats:', JSON.stringify(statsResponse.data.stats, null, 2));

    // Test projects
    console.log('\n3. Testing projects...');
    const projectsResponse = await axios.get(`${baseURL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Projects count:', projectsResponse.data.projects.length);

    // Test analytics
    console.log('\n4. Testing analytics...');
    const analyticsResponse = await axios.get(`${baseURL}/dashboard/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Analytics KPIs:', JSON.stringify(analyticsResponse.data.kpis, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();