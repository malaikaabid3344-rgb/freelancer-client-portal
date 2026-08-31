import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, Briefcase } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge, { statusColor } from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import * as invoiceService from '../services/invoiceService';
import type { Invoice, Client, Project } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await invoiceService.getInvoice(id);
      setInvoice(res.data);
    } catch {
      showToast('Failed to load invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [id]); // eslint-disable-line

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      await invoiceService.markInvoicePaid(invoice._id);
      showToast('Invoice marked as paid');
      fetchInvoice();
    } catch {
      showToast('Failed to update invoice', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) return null;

  const client = invoice.client as Client;
  const project = invoice.project as Project | undefined;
  const afterDiscount = invoice.subtotal - (invoice.subtotal * invoice.discount) / 100;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex gap-2">
          {invoice.status !== 'Paid' && (
            <Button variant="outline" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleMarkPaid}>
              Mark as Paid
            </Button>
          )}
          <Button icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print / Download
          </Button>
        </div>
      </div>

      <Card className="p-8 sm:p-10 print:shadow-none print:border-0">
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Freelancer Portal</p>
              <p className="text-xs text-slate-500">Client Portal</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900">INVOICE</h2>
            <p className="text-sm text-slate-500">{invoice.invoiceNumber}</p>
            <div className="mt-2"><Badge color={statusColor(invoice.status)}>{invoice.status}</Badge></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs uppercase text-slate-400 font-medium mb-1.5">Billed To</p>
            <p className="font-medium text-slate-900">{client?.name}</p>
            <p className="text-slate-600">{client?.company}</p>
            <p className="text-slate-600">{client?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-medium mb-1.5">Project</p>
            <p className="text-slate-700">{project?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-medium mb-1.5">Dates</p>
            <p className="text-slate-700">Issued: {formatDate(invoice.issueDate)}</p>
            <p className="text-slate-700">Due: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">Service</th>
              <th className="pb-2 font-medium text-right">Qty</th>
              <th className="pb-2 font-medium text-right">Rate</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 text-slate-800">{item.service}</td>
                <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Discount ({invoice.discount}%)</span><span>-{formatCurrency(invoice.subtotal * invoice.discount / 100)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax ({invoice.tax}%)</span><span>+{formatCurrency(afterDiscount * invoice.tax / 100)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200"><span>Total Due</span><span>{formatCurrency(invoice.total)}</span></div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs uppercase text-slate-400 font-medium mb-1.5">Notes</p>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
