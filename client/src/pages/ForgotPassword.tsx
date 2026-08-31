import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    // Simulated request — wire this up to a real /api/auth/forgot-password endpoint if you add one.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-7">
            We've sent password reset instructions to <span className="font-medium text-slate-700">{email}</span>
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Forgot Password?</h2>
          <p className="text-sm text-slate-500 mb-7">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Send Reset Instructions
            </Button>
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 pt-1">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
