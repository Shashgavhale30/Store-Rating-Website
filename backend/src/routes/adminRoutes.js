const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, requireRole(['ADMIN']), adminController.getStats);

module.exports = router;
