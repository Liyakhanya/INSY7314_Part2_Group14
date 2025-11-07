const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 12 },
  role: { type: String, enum: ['superadmin', 'admin', 'employee'], required: true }
}, { timestamps: true });

employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);