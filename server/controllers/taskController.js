const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const { search, status, project, priority } = req.query;
    const query = { owner: req.user._id };
    if (status && status !== 'All') query.status = status;
    if (project && project !== 'All') query.project = project;
    if (priority && priority !== 'All') query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    const populated = await task.populate([{ path: 'project', select: 'name' }, { path: 'client', select: 'name' }]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate([{ path: 'project', select: 'name' }, { path: 'client', select: 'name' }]);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
