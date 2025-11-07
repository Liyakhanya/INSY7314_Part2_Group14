const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Employee = require('./models/employee');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.CONN_STRING, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    const existingAdmin = await Employee.findOne({ role: 'superadmin' });

    if (existingAdmin) {
      // Hash the password properly
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('SuperAdminSecure123!', saltRounds);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Super admin password updated:', existingAdmin.username);
    } else {
      // Create new super admin with hashed password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('SuperAdminSecure123!', saltRounds);
      
      const superAdmin = await Employee.create({
        fullName: 'System Super Administrator',
        username: 'superadmin',
        password: hashedPassword, // Now properly hashed
        role: 'superadmin'
      });
      console.log('Super admin created:', superAdmin.username);
    }

    console.log('Use this password to login: SuperAdminSecure123!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating/updating super admin:', err);
    process.exit(1);
  }
};

seedSuperAdmin();