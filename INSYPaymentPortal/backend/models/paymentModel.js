const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payerName: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Payment', paymentSchema);
