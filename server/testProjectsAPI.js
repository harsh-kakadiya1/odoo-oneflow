const http = require('http');

// Test what user is currently authenticated (if any)
async function testCurrentUser() {
  return new Promise((resolve, reject) => {
    // First try to get token from a login
    const loginData = JSON.stringify({
      email: 'sarah.johnson@designstudio.com',
      password: 'password123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginReq = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const loginResponse = JSON.parse(data);
          console.log('Login successful!');
          console.log('Token:', loginResponse.token);
          console.log('User:', loginResponse.user);
          
          // Now test projects API with this token
          testProjectsAPI(loginResponse.token);
          
        } else {
          console.error(`Login failed: ${res.statusCode} ${data}`);
        }
      });
    });

    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

function testProjectsAPI(token) {
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
      console.log('\n--- PROJECTS API RESPONSE ---');
      console.log('Status:', res.statusCode);
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('Projects found:', response.projects.length);
        response.projects.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (ID: ${project.id}, Company: ${project.company_id})`);
        });
      } else {
        console.log('Error response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Projects API error:', e.message);
  });

  req.end();
}

testCurrentUser();