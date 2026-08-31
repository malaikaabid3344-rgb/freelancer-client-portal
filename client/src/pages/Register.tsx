import { useState, FormEvent, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(password), [password]);
  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'][strength];

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Full name is required';
    if (!email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    if (!agree) next.agree = 'You must accept the terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || 'Could not create account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
      <p className="text-sm text-slate-500 mb-7">Start managing your freelance business today</p>

      {errors.form && (
        <div className="mb-4 text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {errors.form}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          icon={<User className="w-4 h-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            rightElement={
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < strength ? strengthColor : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">{strengthLabel}</p>
            </div>
          )}
        </div>
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          icon={<Lock className="w-4 h-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            I agree to the <span className="text-primary-600 font-medium">Terms of Service</span> and{' '}
            <span className="text-primary-600 font-medium">Privacy Policy</span>
          </label>
          {errors.agree && <p className="mt-1 text-xs text-danger">{errors.agree}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create Account
        </Button>

        <p className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
