import { useNav } from '@/context/NavContext';
import { useApp } from '@/context/AppContext';
import { ArrowRight, GraduationCap, Shield } from 'lucide-react';

export function RoleSelect() {
  const { navigate } = useNav();
  const { setRole } = useApp();

  const choose = (role: 'student' | 'admin', route: 'home' | 'admin-dashboard') => {
    setRole(role);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-ink-off-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-ink-black flex items-center justify-center">
              <span className="text-ink-white font-bold text-lg tracking-tighter">A</span>
            </div>
            <div className="leading-none">
              <p className="font-bold text-lg text-ink-charcoal tracking-tight">ACVOSA</p>
              <p className="text-2xs text-ink-dark-grey/60 tracking-wider uppercase mt-1">Connect</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink-charcoal tracking-tight leading-tight">
            Choose your experience
          </h1>
          <p className="text-sm sm:text-base text-ink-dark-grey/70 mt-3 tracking-tight">
            The institutional platform for ACVOSA — University of Venda.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => choose('student', 'home')}
              className="group flex items-center gap-4 p-5 bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-ink-charcoal flex items-center justify-center shrink-0">
                <GraduationCap size={22} className="text-ink-white" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-charcoal tracking-tight">Student</p>
                <p className="text-sm text-ink-dark-grey/65 tracking-tight mt-0.5">Discover activities, reserve places, track attendance</p>
              </div>
              <ArrowRight size={18} className="text-ink-dark-grey/40 group-hover:text-ink-charcoal group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => choose('admin', 'admin-dashboard')}
              className="group flex items-center gap-4 p-5 bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-ink-black flex items-center justify-center shrink-0">
                <Shield size={22} className="text-ink-white" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-charcoal tracking-tight">ACVOSA Administrator</p>
                <p className="text-sm text-ink-dark-grey/65 tracking-tight mt-0.5">Manage activities, attendance, projects and impact</p>
              </div>
              <ArrowRight size={18} className="text-ink-dark-grey/40 group-hover:text-ink-charcoal group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <p className="text-xs text-ink-dark-grey/45 mt-8 tracking-tight text-center">
            Demonstration prototype — all data is illustrative.
          </p>
        </div>
      </div>
    </div>
  );
}
