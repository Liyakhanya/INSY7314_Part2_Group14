const InternationalPayment = require("../models/internationalPaymentModel.js");

// Enhanced validation patterns
const patterns = {
  amount: /^\d+(\.\d{1,2})?$/,
  currency: /^[A-Z]{3}$/,
  accountNumber: /^[A-Z0-9]{8,34}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  name: /^[a-zA-Z\s]{2,100}$/,
  country: /^[a-zA-Z\s]{2,50}$/,
  reference: /^[A-Z0-9\s-]{0,35}$/
};

const createInternationalPayment = async (req, res) => {
  try {
    const { 
      amount, 
      currency, 
      payeeAccount, 
      swiftCode, 
      payeeName, 
      payeeBank, 
      payeeCountry,
      reference,
      provider = 'SWIFT'
    } = req.body;

    console.log('International payment creation attempt:', { 
      customerId: req.user.userId, 
      amount, 
      currency,
      swiftCode
    });

    // Enhanced input validation
    const errors = [];
    
    if (!amount || !patterns.amount.test(amount.toString()) || parseFloat(amount) <= 0) {
      errors.push('Invalid amount format - must be a positive number with up to 2 decimal places');
    }
    
    const validCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD', 'JPY', 'CHF'];
    if (!currency || !patterns.currency.test(currency) || !validCurrencies.includes(currency)) {
      errors.push('Invalid currency - must be a valid 3-letter currency code (USD, EUR, GBP, ZAR, AUD, CAD, JPY, CHF)');
    }
    
    if (!payeeAccount || !patterns.accountNumber.test(payeeAccount)) {
      errors.push('Invalid payee account number format - must be 8-34 alphanumeric characters');
    }
    
    if (!swiftCode || !patterns.swiftCode.test(swiftCode)) {
      errors.push('Invalid SWIFT code format - must be 8 or 11 characters (e.g., ABCDUS33 or ABCDUS33XXX)');
    }
    
    if (!payeeName || !patterns.name.test(payeeName)) {
      errors.push('Payee name is required and must be 2-100 letters and spaces only');
    }
    
    if (!payeeBank || !patterns.name.test(payeeBank)) {
      errors.push('Payee bank is required and must be 2-100 letters and spaces only');
    }
    
    if (!payeeCountry || !patterns.country.test(payeeCountry)) {
      errors.push('Payee country is required and must be 2-50 letters and spaces only');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false,
        errors 
      });
    }

    // Generate unique reference if not provided
    const paymentReference = reference || `SWIFT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create payment with enhanced validation
    const payment = await InternationalPayment.create({
      customerId: req.user.userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      payeeAccount: payeeAccount.toUpperCase(),
      swiftCode: swiftCode.toUpperCase(),
      payeeName: payeeName.trim(),
      payeeBank: payeeBank.trim(),
      payeeCountry: payeeCountry.trim(),
      provider: provider,
      reference: paymentReference,
      status: 'pending'
    });

    // Populate customer details for response
    await payment.populate('customerId', 'fullName accountNumber');

    res.status(201).json({
      success: true,
      payment: {
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
        customerName: payment.customerId.fullName,
        customerAccount: payment.customerId.accountNumber,
        createdAt: payment.createdAt
      },
      message: 'International payment created successfully and sent for verification'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    
    // Handle duplicate reference
    if (error.code === 11000 && error.keyPattern.reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference already exists, please try again'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Payment creation failed - server error' 
    });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const payments = await InternationalPayment.find({ 
      customerId: req.user.userId 
    })
    .populate('customerId', 'fullName accountNumber')
    .sort({ createdAt: -1 });

    res.status(200).json({
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
        customerName: payment.customerId.fullName,
        customerAccount: payment.customerId.accountNumber,
        createdAt: payment.createdAt
      }))
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch payments' 
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await InternationalPayment.findOne({
      _id: req.params.id,
      customerId: req.user.userId
    }).populate('customerId', 'fullName accountNumber');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        error: 'Payment not found' 
      });
    }

    res.status(200).json({
      success: true,
      payment: {
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
        customerName: payment.customerId.fullName,
        customerAccount: payment.customerId.accountNumber,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch payment' 
    });
  }
};

module.exports = {
  createInternationalPayment,
  getCustomerPayments,
  getPaymentById
};