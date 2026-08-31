const TimeEntry = require('../models/TimeEntry');

const getTimeEntries = async (req, res, next) => {
  try {
    const { project, from, to } = req.query;
    const query = { owner: req.user._id };
    if (project && project !== 'All') query.project = project;
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }
    const entries = await TimeEntry.find(query)
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ startTime: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

const createTimeEntry = async (req, res, next) => {
  try {
    const body = { ...req.body, owner: req.user._id };
    if (body.startTime && body.endTime) {
      body.durationMinutes = Math.round((new Date(body.endTime) - new Date(body.startTime)) / 60000);
    }
    const entry = await TimeEntry.create(body);
    const populated = await entry.populate([{ path: 'project', select: 'name' }, { path: 'task', select: 'title' }]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updateTimeEntry = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.startTime && body.endTime) {
      body.durationMinutes = Math.round((new Date(body.endTime) - new Date(body.startTime)) / 60000);
    }
    const entry = await TimeEntry.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      body,
      { new: true }
    ).populate([{ path: 'project', select: 'name' }, { path: 'task', select: 'title' }]);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

const deleteTimeEntry = async (req, res, next) => {
  try {
    const entry = await TimeEntry.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });
    res.json({ message: 'Time entry deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry };
