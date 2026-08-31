const path = require('path');
const fs = require('fs');
const File = require('../models/File');

const getFiles = async (req, res, next) => {
  try {
    const { search, project, type } = req.query;
    const query = { owner: req.user._id };
    if (project && project !== 'All') query.project = project;
    if (type && type !== 'All') query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    const files = await File.find(query)
      .populate('project', 'name')
      .sort({ updatedAt: -1 });
    res.json(files);
  } catch (err) {
    next(err);
  }
};

// Uses multer middleware upstream (req.file) - see routes/fileRoutes.js
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const file = await File.create({
      owner: req.user._id,
      project: req.body.project || undefined,
      client: req.body.client || undefined,
      name: req.file.originalname,
      type: ext,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      sharedWithClient: req.body.sharedWithClient === 'true'
    });
    res.status(201).json(file);
  } catch (err) {
    next(err);
  }
};

const updateFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Best-effort local cleanup (safe to ignore if using cloud storage instead)
    const localPath = path.join(__dirname, '..', file.path);
    fs.unlink(localPath, () => {});

    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.downloads += 1;
    await file.save();

    const localPath = path.join(__dirname, '..', file.path);
    res.download(localPath, file.name, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFiles, uploadFile, updateFile, deleteFile, downloadFile };
