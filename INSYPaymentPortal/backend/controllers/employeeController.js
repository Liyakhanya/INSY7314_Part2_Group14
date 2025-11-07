const Employee = require('../models/employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const generateJWT = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Employee login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    // FIX: Validate and sanitize username before query
    if (typeof username !== 'string') {
      return res.status(400).json({ message: 'Invalid username format' });
    }
    const sanitizedUsername = username.trim().toLowerCase();
    
    const employee = await Employee.findOne({ username: sanitizedUsername });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, employee.password);
    console.log('Password match:', match);
    
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateJWT({ id: employee._id, role: employee.role });
    
    res.json({ 
      token, 
      role: employee.role,
      user: {
        id: employee._id,
        username: employee.username,
        fullName: employee.fullName
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { fullName, username, password, role } = req.body;
    
    console.log('Creating employee:', username);
    
    if (!fullName || !username || !password) {
      return res.status(400).json({ message: 'Full name, username, and password are required' });
    }
    
    // FIX: Validate and sanitize username before query
    if (typeof username !== 'string') {
      return res.status(400).json({ message: 'Invalid username format' });
    }
    const sanitizedUsername = username.trim().toLowerCase();
    
    const existingEmployee = await Employee.findOne({ username: sanitizedUsername });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const newEmp = await Employee.create({ 
      fullName, 
      username: sanitizedUsername, 
      password: password,
      role: role || 'employee' 
    });
    
    const employeeResponse = newEmp.toObject();
    delete employeeResponse.password;
    
    console.log('Employee created successfully:', sanitizedUsername);
    
    res.json({ 
      message: 'Employee created successfully',
      employee: employeeResponse
    });
    
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ 
      message: 'Server error creating employee',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ 
      message: 'Server error fetching employees',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // FIX: Validate MongoDB ObjectId format before query
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    
    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ 
      message: 'Employee deleted successfully',
      deletedEmployee: {
        username: employee.username,
        fullName: employee.fullName
      }
    });
    
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ 
      message: 'Server error deleting employee',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};