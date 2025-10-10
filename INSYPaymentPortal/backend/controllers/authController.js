const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel.js');
require('dotenv').config();

// Enhanced validation patterns for banking
const patterns = {
  username: /^[a-zA-Z0-9_]{3,30}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  accountNumber: /^[A-Z0-9]{8,34}$/,
  fullName: /^[a-zA-Z\s]{2,100}$/,
  idNumber: /^[A-Z0-9-]{5,20}$/
};

const generateJwt = (customer) => {
  return jwt.sign({ 
    userId: customer._id, 
    username: customer.username,
    accountNumber: customer.accountNumber,
    fullName: customer.fullName,
    type: 'customer'
  }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const register = async (req, res) => {
  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    console.log('Registration attempt:', { fullName, idNumber, accountNumber, username });

    // Enhanced input validation
    const validationErrors = [];
    
    if (!fullName || !patterns.fullName.test(fullName)) {
      validationErrors.push('Full name must be 2-100 letters and spaces only');
    }
    if (!idNumber || !patterns.idNumber.test(idNumber)) {
      validationErrors.push('ID number must be 5-20 alphanumeric characters and hyphens');
    }
    if (!accountNumber || !patterns.accountNumber.test(accountNumber)) {
      validationErrors.push('Account number must be 8-34 alphanumeric characters');
    }
    if (!username || !patterns.username.test(username)) {
      validationErrors.push('Username must be 3-30 characters, letters, numbers and underscores only');
    }
    if (!password || !patterns.password.test(password)) {
      validationErrors.push('Password must be at least 12 characters with uppercase, lowercase, number and special character (@$!%*?&)');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        errors: validationErrors 
      });
    }

    // Check if user already exists
    const existingCustomer = await Customer.findOne({
      $or: [
        { username: username.toLowerCase() },
        { idNumber: idNumber.toUpperCase() },
        { accountNumber: accountNumber.toUpperCase() }
      ]
    });

    if (existingCustomer) {
      let errorMessage = 'Customer already exists';
      if (existingCustomer.username === username.toLowerCase()) {
        errorMessage = 'Username already taken';
      } else if (existingCustomer.idNumber === idNumber.toUpperCase()) {
        errorMessage = 'ID number already registered';
      } else if (existingCustomer.accountNumber === accountNumber.toUpperCase()) {
        errorMessage = 'Account number already registered';
      }
      
      return res.status(400).json({ 
        success: false,
        error: errorMessage 
      });
    }

    // Enhanced password hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create customer with normalized data
    const customer = await Customer.create({
      fullName: fullName.trim(),
      idNumber: idNumber.toUpperCase(),
      accountNumber: accountNumber.toUpperCase(),
      username: username.toLowerCase(),
      password: hashedPassword
    });

    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;

    const token = generateJwt(customer);
    
    res.status(201).json({
      success: true,
      token,
      customer: {
        id: customer._id,
        username: customer.username,
        fullName: customer.fullName,
        accountNumber: customer.accountNumber
      },
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      return res.status(400).json({ 
        success: false,
        error: message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Registration failed - server error' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, accountNumber, password } = req.body;

    console.log('Login attempt:', { username, accountNumber });

    // Enhanced input validation
    const validationErrors = [];
    
    if (!username || !patterns.username.test(username)) {
      validationErrors.push('Invalid username format');
    }
    if (!accountNumber || !patterns.accountNumber.test(accountNumber)) {
      validationErrors.push('Invalid account number format');
    }
    if (!password) {
      validationErrors.push('Password is required');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        errors: validationErrors 
      });
    }

    const customer = await Customer.findOne({ 
      username: username.toLowerCase(),
      accountNumber: accountNumber.toUpperCase()
    });

    if (!customer) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const token = generateJwt(customer);
    
    res.status(200).json({
      success: true,
      token,
      customer: {
        id: customer._id,
        username: customer.username,
        fullName: customer.fullName,
        accountNumber: customer.accountNumber
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Login failed - server error' 
    });
  }
};

const logout = async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};

module.exports = { register, login, logout };