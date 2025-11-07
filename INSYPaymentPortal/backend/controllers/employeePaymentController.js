const InternationalPayment = require("../models/internationalPaymentModel.js");

exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await InternationalPayment.find({ status: 'pending' })
      .populate('customerId', 'fullName accountNumber email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        payeeName: payment.payeeName,
        payeeAccount: payment.payeeAccount,
        swiftCode: payment.swiftCode,
        payeeBank: payment.payeeBank,
        payeeCountry: payment.payeeCountry,
        provider: payment.provider,
        status: payment.status,
        reference: payment.reference,
        customerName: payment.customerId?.fullName,
        customerAccount: payment.customerId?.accountNumber,
        customerEmail: payment.customerId?.email,
        createdAt: payment.createdAt
      }))
    });
  } catch (err) {
    console.error('Get pending payments error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching pending payments' 
    });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const payment = await InternationalPayment.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    ).populate('customerId', 'fullName accountNumber email');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        error: 'Payment not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Payment approved successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        payeeName: payment.payeeName,
        status: payment.status,
        reference: payment.reference,
        customerName: payment.customerId?.fullName,
        updatedAt: payment.updatedAt
      }
    });
  } catch (err) {
    console.error('Approve payment error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error approving payment' 
    });
  }
};

exports.denyPayment = async (req, res) => {
  try {
    const payment = await InternationalPayment.findByIdAndUpdate(
      req.params.id, 
      { status: 'denied' }, 
      { new: true }
    ).populate('customerId', 'fullName accountNumber email');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        error: 'Payment not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Payment denied successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        payeeName: payment.payeeName,
        status: payment.status,
        reference: payment.reference,
        customerName: payment.customerId?.fullName,
        updatedAt: payment.updatedAt
      }
    });
  } catch (err) {
    console.error('Deny payment error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error denying payment' 
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await InternationalPayment.find({ 
      status: { $in: ['approved', 'denied'] } 
    })
    .populate('customerId', 'fullName accountNumber email')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        payeeName: payment.payeeName,
        payeeAccount: payment.payeeAccount,
        swiftCode: payment.swiftCode,
        payeeBank: payment.payeeBank,
        payeeCountry: payment.payeeCountry,
        provider: payment.provider,
        status: payment.status,
        reference: payment.reference,
        customerName: payment.customerId?.fullName,
        customerAccount: payment.customerId?.accountNumber,
        customerEmail: payment.customerId?.email,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    });
  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching payment history' 
    });
  }
};