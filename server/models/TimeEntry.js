const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    billable: { type: Boolean, default: true },
    source: { type: String, enum: ['timer', 'manual'], default: 'manual' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
