const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/', verifyToken, storeController.getAllStores);
router.get('/owner/me', verifyToken, requireRole(['OWNER']), storeController.getStoresByOwner);
router.post('/', verifyToken, requireRole(['ADMIN']), upload.single('photo'), storeController.createStore);
router.post('/bulk', verifyToken, requireRole(['ADMIN']), storeController.createBulkStores);

module.exports = router;
