import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { signIn, DEMO_ACCOUNTS } from '@/firebase/auth';
import { DEMO_MODE } from '@/firebase/config';

export function LoginPage() {
  const { demoMode } = useAuth();
  const { navigate } = useNav();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-ink-off-white flex flex-col">
      {demoMode && (
        <div className="bg-ink-charcoal text-ink-white text-center py-1.5 text-2xs font-medium tracking-tight">
          Demo Mode — Data is not being saved to Firebase
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-ink-black flex items-center justify-center">
              <span className="text-ink-white font-bold text-lg tracking-tighter">A</span>
            </div>
            <div className="leading-none">
              <p className="font-bold text-lg text-ink-charcoal tracking-tight">ACVOSA</p>
              <p className="text-2xs text-ink-dark-grey/60 tracking-wider uppercase mt-1">Connect</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink-charcoal tracking-tight">Sign in</h1>
          <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Access your ACVOSA Connect account.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors"
                placeholder="you@student.univen.ac.za"
              />
            </div>
            <div>
              <label className="text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-ink-charcoal bg-ink-light-grey rounded-xl px-4 py-3 tracking-tight">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-ink-black text-ink-white text-sm font-medium tracking-tight hover:bg-ink-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button onClick={() => navigate('register')} className="text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight transition-colors">
              Create account
            </button>
            <button onClick={() => navigate('forgot-password')} className="text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight transition-colors">
              Forgot password?
            </button>
          </div>

          {DEMO_MODE && (
            <div className="mt-8 border-t border-ink-light-grey pt-6">
              <p className="text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/50 mb-3">Demo Accounts</p>
              <div className="flex flex-col gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc)}
                    className="flex items-center justify-between p-3 rounded-xl bg-ink-white border border-ink-light-grey hover:border-ink-grey transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-charcoal tracking-tight">{acc.label}</p>
                      <p className="text-xs text-ink-dark-grey/55 tracking-tight mt-0.5">{acc.email}</p>
                    </div>
                    <span className="text-2xs text-ink-dark-grey/45 tracking-tight">Click to fill</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
