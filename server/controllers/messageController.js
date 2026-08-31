const Message = require('../models/Message');
const Client = require('../models/Client');

// Returns one conversation thread per client, with last message + unread count
const getConversations = async (req, res, next) => {
  try {
    const clients = await Client.find({ owner: req.user._id });
    const conversations = await Promise.all(
      clients.map(async (client) => {
        const messages = await Message.find({ owner: req.user._id, client: client._id }).sort({ createdAt: 1 });
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter((m) => m.sender === 'client' && !m.read).length;
        return {
          client: { _id: client._id, name: client.name, company: client.company, avatar: client.avatar },
          lastMessage: lastMessage || null,
          unreadCount,
          messageCount: messages.length
        };
      })
    );
    conversations.sort((a, b) => {
      const at = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const bt = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return bt - at;
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

const getMessagesForClient = async (req, res, next) => {
  try {
    const messages = await Message.find({ owner: req.user._id, client: req.params.clientId }).sort({ createdAt: 1 });
    await Message.updateMany(
      { owner: req.user._id, client: req.params.clientId, sender: 'client', read: false },
      { read: true }
    );
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { clientId, text, attachment } = req.body;
    const message = await Message.create({
      owner: req.user._id,
      client: clientId,
      sender: 'user',
      text: text || '',
      attachment: attachment || ''
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations, getMessagesForClient, sendMessage };
