const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole(['ADMIN']), userController.getAllUsers);
router.post('/', verifyToken, requireRole(['ADMIN']), userController.createUserByAdmin);
router.post('/bulk', verifyToken, requireRole(['ADMIN']), userController.createBulkUsers);
router.get('/:id', verifyToken, requireRole(['ADMIN']), userController.getUserById);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), userController.deleteUser);

module.exports = router;
