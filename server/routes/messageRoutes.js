const express = require('express');
const router = express.Router();
const { getConversations, getMessagesForClient, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/conversations', getConversations);
router.get('/:clientId', getMessagesForClient);
router.post('/', sendMessage);

module.exports = router;
