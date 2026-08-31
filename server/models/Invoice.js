const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, default: 0 }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    items: [lineItemSchema],
    tax: { type: Number, default: 0 }, // percent
    discount: { type: Number, default: 0 }, // percent
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Draft', 'Pending', 'Paid', 'Overdue'], default: 'Pending' },
    notes: { type: String, default: '' },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function (next) {
  const subtotal = this.items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const afterDiscount = subtotal - (subtotal * this.discount) / 100;
  const withTax = afterDiscount + (afterDiscount * this.tax) / 100;
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.total = Math.round(withTax * 100) / 100;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
