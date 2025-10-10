const express = require('express');
const { 
  createInternationalPayment, 
  getCustomerPayments, 
  getPaymentById 
} = require('../controllers/paymentController.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/', verifyToken, createInternationalPayment);
router.get('/', verifyToken, getCustomerPayments);
router.get('/:id', verifyToken, getPaymentById);

module.exports = router;