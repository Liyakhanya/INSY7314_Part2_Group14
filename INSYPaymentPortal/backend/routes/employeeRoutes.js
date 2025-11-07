const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authMiddleware, adminOnly } = require('../middlewares/employeeAuth.js');

// Public routes
router.post('/login', employeeController.login);

// Admin only routes
router.get('/employees', authMiddleware, adminOnly, employeeController.getEmployees);
router.post('/employees', authMiddleware, adminOnly, employeeController.createEmployee);
router.delete('/employees/:id', authMiddleware, adminOnly, employeeController.deleteEmployee);

module.exports = router;