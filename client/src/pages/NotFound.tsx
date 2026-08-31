import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
        <Compass className="w-8 h-8 text-primary-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">404 — Page not found</h1>
      <p className="text-slate-500 mb-6 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
