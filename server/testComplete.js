const http = require('http');
const querystring = require('querystring');

async function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'sarah.johnson@designstudio.com',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(`Login failed: ${res.statusCode} ${data}`);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAPI(endpoint, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🔐 Testing login...');
    const loginResponse = await testLogin();
    console.log('✅ Login successful!');
    
    const token = loginResponse.token;
    
    // Test projects
    console.log('\n📁 Testing projects API...');
    const projectsResult = await testAPI('/api/projects', token);
    console.log(`Status: ${projectsResult.status}`);
    if (projectsResult.data.projects) {
      console.log(`Projects count: ${projectsResult.data.projects.length}`);
      if (projectsResult.data.projects.length > 0) {
        console.log('First project:', projectsResult.data.projects[0]);
      }
    } else {
      console.log('Projects response:', projectsResult.data);
    }
    
    // Test dashboard stats
    console.log('\n📊 Testing dashboard stats...');
    const statsResult = await testAPI('/api/dashboard/stats', token);
    console.log(`Status: ${statsResult.status}`);
    console.log('Stats:', JSON.stringify(statsResult.data.stats, null, 2));
    
    // Test analytics
    console.log('\n📈 Testing analytics...');
    const analyticsResult = await testAPI('/api/dashboard/analytics', token);
    console.log(`Status: ${analyticsResult.status}`);
    if (analyticsResult.data.kpis) {
      console.log('KPIs:', JSON.stringify(analyticsResult.data.kpis, null, 2));
    } else {
      console.log('Analytics error:', analyticsResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runTests();