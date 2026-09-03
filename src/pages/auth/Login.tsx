import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';

export function Login() {
  const { signIn, signUp, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setGoogleLoading(false);
    }
    // On success the browser redirects to Google, so no further state change here.
  };

  const handleMicrosoftSignIn = async () => {
    setError(null);
    setInfo(null);
    setMicrosoftLoading(true);
    const { error } = await signInWithMicrosoft();
    if (error) {
      setError(error);
      setMicrosoftLoading(false);
    }
    // On success the browser redirects to Microsoft, so no further state change here.
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        setSubmitting(false);
        return;
      }
      const { error } = await signUp({ email, password, fullName, studentNumber, faculty });
      if (error) {
        setError(error);
      } else {
        setInfo('Check your inbox to confirm your email, then sign in.');
        setMode('signin');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-ink-off-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-ink-black flex items-center justify-center">
              <span className="text-ink-white font-bold text-lg tracking-tighter"><img src="/logo.jpg" alt="Institute for Rural Development logo" className="w-full h-full object-cover" /></span>
            </div>
            <div className="leading-none">
              <p className="font-bold text-lg text-ink-charcoal tracking-tight">UNIVEN IRD</p>
              <p className="text-2xs text-ink-dark-grey/60 tracking-wider uppercase mt-1">Connect</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink-charcoal tracking-tight leading-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm sm:text-base text-ink-dark-grey/70 mt-3 tracking-tight">
            The institutional platform for the Institute for Rural Development — University of Venda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            {mode === 'signup' && (
              <>
                <input
                  required
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="p-4 bg-ink-white border border-ink-light-grey rounded-2xl text-sm tracking-tight focus:outline-none focus:border-ink-grey"
                />
                <input
                  placeholder="Student number (optional)"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="p-4 bg-ink-white border border-ink-light-grey rounded-2xl text-sm tracking-tight focus:outline-none focus:border-ink-grey"
                />
                <input
                  placeholder="Faculty (optional)"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="p-4 bg-ink-white border border-ink-light-grey rounded-2xl text-sm tracking-tight focus:outline-none focus:border-ink-grey"
                />
              </>
            )}
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 bg-ink-white border border-ink-light-grey rounded-2xl text-sm tracking-tight focus:outline-none focus:border-ink-grey"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-4 bg-ink-white border border-ink-light-grey rounded-2xl text-sm tracking-tight focus:outline-none focus:border-ink-grey"
            />

            {error && <p className="text-sm text-red-600 tracking-tight">{error}</p>}
            {info && <p className="text-sm text-emerald-700 tracking-tight">{info}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="group flex items-center justify-center gap-2 p-4 bg-ink-charcoal text-ink-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 font-semibold tracking-tight disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Sign up'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-ink-light-grey" />
            <span className="text-2xs text-ink-dark-grey/45 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-ink-light-grey" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 p-4 mt-6 bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 font-semibold tracking-tight text-ink-charcoal disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={microsoftLoading}
            className="w-full flex items-center justify-center gap-3 p-4 mt-3 bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 font-semibold tracking-tight text-ink-charcoal disabled:opacity-60"
          >
            {microsoftLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#F25022" d="M1 1h7.6v7.6H1V1Z" />
                  <path fill="#7FBA00" d="M9.4 1H17v7.6H9.4V1Z" />
                  <path fill="#00A4EF" d="M1 9.4h7.6V17H1V9.4Z" />
                  <path fill="#FFB900" d="M9.4 9.4H17V17H9.4V9.4Z" />
                </svg>
                Continue with Outlook
              </>
            )}
          </button>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setInfo(null);
            }}
            className="w-full text-center text-sm text-ink-dark-grey/70 mt-6 tracking-tight hover:text-ink-charcoal transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <p className="text-xs text-ink-dark-grey/45 mt-8 tracking-tight text-center">
            New accounts are students by default. Admin access is granted by an existing administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
