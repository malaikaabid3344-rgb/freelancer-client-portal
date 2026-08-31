const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['project', 'invoice', 'message', 'file', 'task'], required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
