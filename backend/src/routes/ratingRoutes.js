const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Normal users can submit ratings and view their own ratings
router.post('/', verifyToken, requireRole(['USER']), ratingController.submitRating);
router.get('/user/me', verifyToken, requireRole(['USER']), ratingController.getUserRatings);
router.get('/store/:storeId', verifyToken, requireRole(['OWNER']), ratingController.getRatingsByStore);

module.exports = router;
