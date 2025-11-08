const http = require('http');

async function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'julikyada293@gmail.com',
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

async function testUsersAPI(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
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

async function runTest() {
  try {
    console.log('🔐 Testing login as Juli Kyada...');
    const loginResponse = await testLogin();
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.user.name, '(', loginResponse.user.role, ')');
    
    const token = loginResponse.token;
    
    console.log('\n👥 Testing users API...');
    const usersResult = await testUsersAPI(token);
    console.log(`Status: ${usersResult.status}`);
    
    if (usersResult.data.users) {
      console.log(`\nUsers available for Juli Kyada (${usersResult.data.users.length} total):`);
      usersResult.data.users.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.name}, Role: ${user.role}, Company: ${user.company_id}`);
      });
    } else {
      console.log('Users API response:', usersResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runTest();