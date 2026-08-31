const Project = require('../models/Project');
const Task = require('../models/Task');
const File = require('../models/File');
const Invoice = require('../models/Invoice');

const getProjects = async (req, res, next) => {
  try {
    const { search, status, client } = req.query;
    const query = { owner: req.user._id };
    if (status && status !== 'All') query.status = status;
    if (client && client !== 'All') query.client = client;
    if (search) query.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(query).populate('client', 'name company').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id }).populate('client');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const [tasks, files, invoices] = await Promise.all([
      Task.find({ project: project._id, owner: req.user._id }),
      File.find({ project: project._id, owner: req.user._id }),
      Invoice.find({ project: project._id, owner: req.user._id })
    ]);

    res.json({ project, tasks, files, invoices });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    const populated = await project.populate('client', 'name company');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name company');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
