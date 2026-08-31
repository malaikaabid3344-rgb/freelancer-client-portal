const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    startDate: { type: Date },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
