const express = require('express');
const router = express.Router();
const { getFiles, uploadFile, updateFile, deleteFile, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);
router.get('/:id/download', downloadFile);

module.exports = router;
