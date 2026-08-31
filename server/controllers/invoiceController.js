const Invoice = require('../models/Invoice');

const generateInvoiceNumber = async (ownerId) => {
  const count = await Invoice.countDocuments({ owner: ownerId });
  return `INV-${String(count + 1).padStart(4, '0')}`;
};

const getInvoices = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = { owner: req.user._id };
    if (status && status !== 'All') query.status = status;

    let invoices = await Invoice.find(query)
      .populate('client', 'name company')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      invoices = invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(s) ||
          (i.client && i.client.name.toLowerCase().includes(s))
      );
    }

    res.json(invoices);
  } catch (err) {
    next(err);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('client')
      .populate('project', 'name');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoiceNumber = await generateInvoiceNumber(req.user._id);
    const invoice = await Invoice.create({ ...req.body, invoiceNumber, owner: req.user._id });
    const populated = await invoice.populate([{ path: 'client', select: 'name company' }, { path: 'project', select: 'name' }]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    Object.assign(invoice, req.body);
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: 'Paid', paidAt: new Date() },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, markAsPaid };
