const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: { type: Date },
    status: { type: String, enum: ['To Do', 'In Progress', 'Review', 'Completed'], default: 'To Do' },
    assignee: { type: String, default: 'Me' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
