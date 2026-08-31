const express = require('express');
const router = express.Router();
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, markAsPaid
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoice).put(updateInvoice).delete(deleteInvoice);
router.put('/:id/mark-paid', markAsPaid);

module.exports = router;
