import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ProjectStatus } from '@/types';
import { ArrowLeft, Check } from 'lucide-react';

const STATUSES: ProjectStatus[] = ['planning', 'active', 'completed'];

interface FormData {
  title: string;
  description: string;
  date: string;
  location: string;
  community: string;
  status: ProjectStatus;
  participants: string;
  volunteers: string;
  sessions: string;
  objective: string;
}

const initial: FormData = {
  title: '', description: '', date: '', location: '', community: '',
  status: 'planning', participants: '0', volunteers: '0', sessions: '0', objective: '',
};

export function AdminCreateProject() {
  const { createProject, pushToast } = useApp();
  const { navigate } = useNav();
  const [form, setForm] = useState<FormData>(initial);
  const [objectivesList, setObjectivesList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const addObjective = () => {
    if (form.objective.trim()) {
      setObjectivesList((o) => [...o, form.objective.trim()]);
      set('objective', '');
    }
  };

  const submit = async () => {
    if (!form.title || !form.date || !form.location || !form.community) {
      pushToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    await createProject({
      title: form.title,
      description: form.description || 'ACVOSA institutional project.',
      objectives: objectivesList,
      date: form.date,
      location: form.location,
      status: form.status,
      team: [],
      participants: parseInt(form.participants, 10) || 0,
      volunteers: parseInt(form.volunteers, 10) || 0,
      sessions: parseInt(form.sessions, 10) || 0,
      satisfaction: 0,
      community: form.community,
      phases: [],
      evidenceUrls: [],
      documents: [],
      results: [],
    });
    setSubmitting(false);
    navigate('admin-projects');
  };

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <button onClick={() => navigate('admin-projects')} className="flex items-center gap-2 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight mb-4">
        <ArrowLeft size={15} /> Back to Projects
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight">Create Project</h1>
      <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Start a new ACVOSA institutional project.</p>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Project Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={label}>Project title *</label>
                <input className={field} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Clean Water Access Initiative" />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea className={`${field} h-24 py-3 resize-none`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the project..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Community *</label>
                  <input className={field} value={form.community} onChange={(e) => set('community', e.target.value)} placeholder="e.g. Thohoyandou" />
                </div>
                <div>
                  <label className={label}>Location *</label>
                  <input className={field} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Vhembe District" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Status & Scope</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Start date *</label>
                <input type="date" className={field} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div>
                <label className={label}>Status</label>
                <select className={field} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Expected participants</label>
                <input type="number" className={field} value={form.participants} onChange={(e) => set('participants', e.target.value)} min={0} />
              </div>
              <div>
                <label className={label}>Volunteers</label>
                <input type="number" className={field} value={form.volunteers} onChange={(e) => set('volunteers', e.target.value)} min={0} />
              </div>
              <div>
                <label className={label}>Planned sessions</label>
                <input type="number" className={field} value={form.sessions} onChange={(e) => set('sessions', e.target.value)} min={0} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Objectives</h2>
            <div className="flex gap-2">
              <input
                className={field}
                value={form.objective}
                onChange={(e) => set('objective', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addObjective(); } }}
                placeholder="Add an objective and press Enter"
              />
              <Button variant="secondary" size="md" onClick={addObjective}>Add</Button>
            </div>
            {objectivesList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {objectivesList.map((o, i) => (
                  <Badge key={i} tone="light">
                    {o}
                    <button onClick={() => setObjectivesList((l) => l.filter((_, idx) => idx !== i))} className="ml-1 opacity-50 hover:opacity-100">✕</button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-3">Preview</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Title</span><span className="font-medium text-ink-charcoal tracking-tight">{form.title || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Community</span><span className="font-medium text-ink-charcoal">{form.community || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Status</span><span className="font-medium text-ink-charcoal capitalize">{form.status}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Start date</span><span className="font-medium text-ink-charcoal">{form.date || '—'}</span></div>
            </div>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={submitting}>
            <Check size={18} /> {submitting ? 'Publishing...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
