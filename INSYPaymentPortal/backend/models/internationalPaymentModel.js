const mongoose = require('mongoose');

const internationalPaymentSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: [true, 'Customer ID is required'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'], 
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Amount must be a valid number with up to 2 decimal places'
    }
  },
  currency: { 
    type: String, 
    required: [true, 'Currency is required'], 
    enum: {
      values: ['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD', 'CHF', 'JPY'],
      message: 'Currency must be a valid 3-letter code'
    },
    uppercase: true
  },
  provider: { 
    type: String, 
    default: 'SWIFT',
    enum: ['SWIFT']
  },
  payeeAccount: { 
    type: String, 
    required: [true, 'Payee account is required'],
    match: [/^[A-Z0-9]{8,34}$/, 'Payee account must be 8-34 alphanumeric characters'],
    uppercase: true
  },
  swiftCode: { 
    type: String, 
    required: [true, 'SWIFT code is required'],
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'SWIFT code must be 8 or 11 characters'],
    uppercase: true
  },
  payeeName: { 
    type: String, 
    required: [true, 'Payee name is required'],
    trim: true,
    match: [/^[a-zA-Z\s]{2,100}$/, 'Payee name must be 2-100 letters and spaces only']
  },
  payeeBank: { 
    type: String, 
    required: [true, 'Payee bank is required'],
    trim: true,
    match: [/^[a-zA-Z\s]{2,100}$/, 'Payee bank must be 2-100 letters and spaces only']
  },
  payeeCountry: { 
    type: String, 
    required: [true, 'Payee country is required'],
    trim: true,
    match: [/^[a-zA-Z\s]{2,50}$/, 'Payee country must be 2-50 letters and spaces only']
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: {
      values: ['pending', 'verified', 'submitted', 'completed', 'rejected'],
      message: 'Status must be pending, verified, submitted, completed, or rejected'
    }
  },
  reference: { 
    type: String, 
    required: [true, 'Reference is required'],
    unique: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
internationalPaymentSchema.index({ customerId: 1, createdAt: -1 });
internationalPaymentSchema.index({ status: 1 });
internationalPaymentSchema.index({ reference: 1 });

module.exports = mongoose.model('InternationalPayment', internationalPaymentSchema);