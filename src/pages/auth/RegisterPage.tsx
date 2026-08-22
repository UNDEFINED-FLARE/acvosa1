import { useState } from 'react';
import { useNav } from '@/context/NavContext';
import { signUp } from '@/firebase/auth';

export function RegisterPage() {
  const { navigate } = useNav();
  const [form, setForm] = useState({
    firstName: '', lastName: '', studentNumber: '', email: '',
    password: '', faculty: '', course: '', yearLevel: '1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        firstName: form.firstName,
        lastName: form.lastName,
        studentNumber: form.studentNumber,
        faculty: form.faculty,
        course: form.course,
        yearLevel: form.yearLevel,
      });
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  return (
    <div className="min-h-screen bg-ink-off-white flex flex-col">
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

          <h1 className="text-2xl font-bold text-ink-charcoal tracking-tight">Create account</h1>
          <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Join ACVOSA Connect as a student member.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>First name</label>
                <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>Last name</label>
                <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={field} />
              </div>
            </div>
            <div>
              <label className={label}>Student number</label>
              <input required value={form.studentNumber} onChange={(e) => set('studentNumber', e.target.value)} className={field} placeholder="2023XXXXX" />
            </div>
            <div>
              <label className={label}>Email</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={field} placeholder="you@student.univen.ac.za" />
            </div>
            <div>
              <label className={label}>Password</label>
              <input type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} className={field} placeholder="At least 6 characters" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Faculty</label>
                <input required value={form.faculty} onChange={(e) => set('faculty', e.target.value)} className={field} placeholder="Management Sciences" />
              </div>
              <div>
                <label className={label}>Course</label>
                <input value={form.course} onChange={(e) => set('course', e.target.value)} className={field} placeholder="BCom Economics" />
              </div>
            </div>
            <div>
              <label className={label}>Year level</label>
              <select value={form.yearLevel} onChange={(e) => set('yearLevel', e.target.value)} className={field}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4 (Honours)</option>
                <option value="pg">Postgraduate</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-ink-charcoal bg-ink-light-grey rounded-xl px-4 py-3 tracking-tight">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-ink-black text-ink-white text-sm font-medium tracking-tight hover:bg-ink-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-dark-grey/70 tracking-tight">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-ink-charcoal font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
