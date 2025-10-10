const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    match: [/^[a-zA-Z\s]{2,100}$/, 'Full name must be 2-100 letters and spaces only']
  },
  idNumber: { 
    type: String, 
    required: [true, 'ID number is required'], 
    unique: true,
    match: [/^[A-Z0-9-]{5,20}$/, 'ID number must be 5-20 alphanumeric characters and hyphens']
  },
  accountNumber: { 
    type: String, 
    required: [true, 'Account number is required'], 
    unique: true,
    match: [/^[A-Z0-9]{8,34}$/, 'Account number must be 8-34 alphanumeric characters']
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3-30 characters, letters, numbers and underscores only']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [12, 'Password must be at least 12 characters long']
  }
}, { 
  timestamps: true 
});

// Index for faster queries
customerSchema.index({ username: 1 });
customerSchema.index({ accountNumber: 1 });
customerSchema.index({ idNumber: 1 });

module.exports = mongoose.model('Customer', customerSchema);