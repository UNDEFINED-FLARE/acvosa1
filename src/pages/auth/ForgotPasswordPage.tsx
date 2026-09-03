import { useState } from 'react';
import { useNav } from '@/context/NavContext';
import { resetPassword } from '@/firebase/auth';
import { Check, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const { navigate } = useNav();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-off-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-ink-black flex items-center justify-center">
              <span className="text-ink-white font-bold text-lg tracking-tighter"><img src="/logo.jpg" alt="Institute for Rural Development logo" className="w-full h-full object-cover" /></span>
            </div>
            <div className="leading-none">
              <p className="font-bold text-lg text-ink-charcoal tracking-tight">UNIVEN IRD</p>
              <p className="text-2xs text-ink-dark-grey/60 tracking-wider uppercase mt-1">Connect</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-ink-black flex items-center justify-center mx-auto">
                <Check size={28} className="text-ink-white" />
              </div>
              <h1 className="text-xl font-bold text-ink-charcoal tracking-tight mt-4">Check your email</h1>
              <p className="text-sm text-ink-dark-grey/65 mt-2 tracking-tight">
                If an account exists for {email}, a password reset link has been sent.
              </p>
              <button
                onClick={() => navigate('login')}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-charcoal hover:underline tracking-tight"
              >
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-ink-charcoal tracking-tight">Reset password</h1>
              <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Enter your email to receive a reset link.</p>

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
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-xl bg-ink-black text-ink-white text-sm font-medium tracking-tight hover:bg-ink-charcoal transition-colors disabled:opacity-40"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <button onClick={() => navigate('login')} className="mt-4 flex items-center gap-2 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight transition-colors">
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
