const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Employee = require('../models/employee');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Use environment variable or fallback for Docker
    const connectionString = process.env.CONN_STRING || 'mongodb://mongodb:27017/bankportal';
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const superAdminExists = await Employee.findOne({ role: 'superadmin' });
    
    if (superAdminExists) {
      console.log('✅ Super admin already exists:');
      console.log('   Username:', superAdminExists.username);
      console.log('   Role:', superAdminExists.role);
    } else {
      // Create super admin
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('SuperAdminSecure123!', saltRounds);
      
      const superAdmin = await Employee.create({
        fullName: 'System Super Administrator',
        username: 'superadmin',
        password: hashedPassword,
        role: 'superadmin'
      });
      
      console.log('✅ Super admin created successfully!');
      console.log('   Username: superadmin');
      console.log('   Password: SuperAdminSecure123!');
      console.log('   Role: superadmin');
      console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createSuperAdmin();