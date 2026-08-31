const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive', 'Lead'], default: 'Active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
