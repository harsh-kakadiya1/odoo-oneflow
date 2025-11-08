const db = require('./config/database');
const { User } = require('./models');

(async () => {
  try {
    await db.connectDB();
    const users = await User.findAll({ 
      attributes: ['id', 'name', 'email', 'role', 'company_id'],
      order: [['role', 'ASC'], ['name', 'ASC']]
    });
    
    console.log('All users in database:');
    console.log('=====================================');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Company: ${u.company_id}`);
    });
    
    console.log('\nUser count by role:');
    const roleCount = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();