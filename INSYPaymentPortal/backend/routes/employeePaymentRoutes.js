const express = require('express');
const router = express.Router();
const { getPendingPayments, approvePayment, denyPayment, getPaymentHistory } = require('../controllers/employeePaymentController');
const { authMiddleware, employeeOnly } = require('../middlewares/employeeAuth.js'); 

router.use(authMiddleware, employeeOnly);

router.get('/pending', getPendingPayments);
router.put('/:id/approve', approvePayment);
router.put('/:id/deny', denyPayment);
router.get('/history', getPaymentHistory);

module.exports = router;