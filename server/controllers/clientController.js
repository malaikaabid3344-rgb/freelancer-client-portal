const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const File = require('../models/File');

const getClients = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = { owner: req.user._id };
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

const getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, owner: req.user._id });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const [projects, invoices, files] = await Promise.all([
      Project.find({ client: client._id, owner: req.user._id }).sort({ createdAt: -1 }),
      Invoice.find({ client: client._id, owner: req.user._id }).sort({ createdAt: -1 }),
      File.find({ client: client._id, owner: req.user._id }).sort({ createdAt: -1 })
    ]);

    res.json({ client, projects, invoices, files });
  } catch (err) {
    next(err);
  }
};

const createClient = async (req, res, next) => {
  try {
    const client = await Client.create({ ...req.body, owner: req.user._id });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
