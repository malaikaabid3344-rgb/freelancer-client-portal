import { ReactNode } from 'react';
import { Briefcase, TrendingUp, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-500 relative overflow-hidden flex-col justify-center px-14 text-white">
        <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-30">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Freelancer</p>
            <p className="text-xs text-primary-100 leading-tight">Client Portal</p>
          </div>
        </div>

        <h1 className="text-4xl font-bold leading-tight mb-4">
          Manage Projects.
          <br />
          Collaborate Seamlessly.
          <br />
          <span className="text-cyan-300">Achieve More.</span>
        </h1>
        <p className="text-primary-100 max-w-md mb-10">
          A complete workspace to manage clients, track projects, share files, and get paid — all in one place.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <TrendingUp className="w-5 h-5 mb-2 text-cyan-300" />
            <p className="text-sm font-medium">Project Progress</p>
            <p className="text-2xl font-bold">75%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <CheckCircle2 className="w-5 h-5 mb-2 text-cyan-300" />
            <p className="text-sm font-medium">Total Projects</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-10">
          <ShieldCheck className="w-3.5 h-3.5" /> Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
}
