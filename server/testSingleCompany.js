const http = require('http');

async function testLoginAndData() {
  // Test login with Juli Kyada
  const loginData = JSON.stringify({
    email: 'julikyada293@gmail.com',
    password: 'password123'
  });

  console.log('🔐 Testing login with Juli Kyada...');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const loginResponse = JSON.parse(data);
            console.log('✅ Login successful!');
            console.log('User:', loginResponse.user.name, '- Company ID:', loginResponse.user.company_id);
            
            // Test projects with this token
            testProjects(loginResponse.token);
            
          } else {
            console.log(`❌ Login failed: ${res.statusCode} - ${data}`);
          }
        } catch (error) {
          console.error('Parse error:', error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
    });

    req.write(loginData);
    req.end();
  });
}

function testProjects(token) {
  console.log('\n📁 Testing projects API...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Projects API Status:', res.statusCode);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ Projects found:', response.projects.length);
        
        response.projects.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (Company: ${project.company_id})`);
        });
        
        // Test dashboard stats
        testDashboard(token);
        
      } else {
        console.log('❌ Projects API error:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Projects request error:', error);
  });

  req.end();
}

function testDashboard(token) {
  console.log('\n📊 Testing dashboard stats...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Dashboard API Status:', res.statusCode);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ Dashboard stats:');
        console.log(JSON.stringify(response.stats, null, 2));
      } else {
        console.log('❌ Dashboard API error:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Dashboard request error:', error);
  });

  req.end();
}

testLoginAndData();