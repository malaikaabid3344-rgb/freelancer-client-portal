const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const TimeEntry = require('../models/TimeEntry');
const mongoose = require('mongoose');

const getEarningsReport = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const monthly = await Invoice.aggregate([
      { $match: { owner: ownerId, status: 'Paid' } },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totals = await Invoice.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$status', total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    res.json({ monthly, totals });
  } catch (err) {
    next(err);
  }
};

const getProjectsReport = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const byStatus = await Project.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 }, budget: { $sum: '$budget' } } }
    ]);
    res.json({ byStatus });
  } catch (err) {
    next(err);
  }
};

const getClientsReport = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const revenueByClient = await Invoice.aggregate([
      { $match: { owner: ownerId, status: 'Paid' } },
      { $group: { _id: '$client', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ]);
    res.json({ revenueByClient });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEarningsReport, getProjectsReport, getClientsReport };
