require('dotenv').config();
const { User } = require('./models');
const { connectDB } = require('./config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('\n🚀 OneFlow Admin User Creation\n');
    console.log('This script will create the first admin user for your OneFlow system.\n');

    await connectDB();

    // Check if any admin exists
    const existingAdmin = await User.findOne({ where: { role: 'Admin' } });
    
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}\n`);
      
      const overwrite = await question('Do you want to create another admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Admin creation cancelled.');
        process.exit(0);
      }
    }

    console.log('\nPlease enter admin details:');
    const name = await question('Full Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 6 characters): ');

    if (!name || !email || !password) {
      console.log('\n❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('\n❌ A user with this email already exists!');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password_hash: password, // Will be hashed automatically by the model
      role: 'Admin',
      hourly_rate: 0,
      is_active: true
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Keep these credentials safe!');
    console.log('🌐 You can now login at http://localhost:3000\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\n❌ Admin creation cancelled by user.');
  process.exit(1);
});

createAdmin();

