import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ActivityCategory, AttendanceMethod } from '@/types';
import { ArrowLeft, Check, ImageIcon } from 'lucide-react';

const CATEGORIES: ActivityCategory[] = ['Workshops', 'Community', 'Academic', 'Leadership', 'Social', 'Volunteer'];
const METHODS: AttendanceMethod[] = ['QR', 'GPS', 'Bluetooth', 'QR + GPS'];

interface FormData {
  name: string;
  description: string;
  category: ActivityCategory;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: string;
  registrationDeadline: string;
  attendanceMethod: AttendanceMethod;
  requirements: string;
  organizer: string;
}

const initial: FormData = {
  name: '', description: '', category: 'Workshops', date: '', startTime: '09:00', endTime: '12:00',
  venue: '', capacity: '50', registrationDeadline: '', attendanceMethod: 'QR + GPS',
  requirements: '', organizer: 'Institute for Rural Development',
};

export function AdminCreateActivity() {
  const { createActivity, pushToast } = useApp();
  const { navigate } = useNav();
  const [form, setForm] = useState<FormData>(initial);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const addRequirement = () => {
    if (form.requirements.trim()) {
      setRequirementsList((r) => [...r, form.requirements.trim()]);
      set('requirements', '');
    }
  };

  const submit = () => {
    if (!form.name || !form.date || !form.venue) {
      pushToast('Please fill in all required fields', 'error');
      return;
    }
    createActivity({
      name: form.name,
      description: form.description || 'Institute activity — details to be announced.',
      category: form.category,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue,
      capacity: parseInt(form.capacity, 10) || 50,
      registrationDeadline: form.registrationDeadline || form.date,
      attendanceMethod: form.attendanceMethod,
      requirements: requirementsList.length > 0 ? requirementsList : ['Valid student card'],
      organizer: form.organizer,
      imageSeed: form.category.toLowerCase(),
    });
    navigate('admin-activities');
  };

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <button onClick={() => navigate('admin-activities')} className="flex items-center gap-2 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight mb-4">
        <ArrowLeft size={15} /> Back to Activities
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight">Create Activity</h1>
      <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Publish a new Institute programme for student registration.</p>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Activity Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={label}>Activity name *</label>
                <input className={field} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Entrepreneurship & Innovation Workshop" />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea className={`${field} h-24 py-3 resize-none`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the activity..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Category</label>
                  <select className={field} value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Organizer</label>
                  <input className={field} value={form.organizer} onChange={(e) => set('organizer', e.target.value)} />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Schedule & Venue</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Date *</label>
                <input type="date" className={field} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div>
                <label className={label}>Venue *</label>
                <input className={field} value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="e.g. UNIVEN Main Campus" />
              </div>
              <div>
                <label className={label}>Start time</label>
                <input type="time" className={field} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </div>
              <div>
                <label className={label}>End time</label>
                <input type="time" className={field} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
              </div>
              <div>
                <label className={label}>Maximum participants</label>
                <input type="number" className={field} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} min={1} />
              </div>
              <div>
                <label className={label}>Registration deadline</label>
                <input type="date" className={field} value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Attendance Method</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => set('attendanceMethod', m)}
                  className={`p-3 rounded-xl border text-sm font-medium tracking-tight transition-all ${
                    form.attendanceMethod === m
                      ? 'border-ink-black bg-ink-light-grey text-ink-charcoal'
                      : 'border-ink-light-grey text-ink-dark-grey hover:border-ink-grey'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Requirements</h2>
            <div className="flex gap-2">
              <input
                className={field}
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                placeholder="Add a requirement and press Enter"
              />
              <Button variant="secondary" size="md" onClick={addRequirement}>Add</Button>
            </div>
            {requirementsList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {requirementsList.map((r, i) => (
                  <Badge key={i} tone="light">
                    {r}
                    <button onClick={() => setRequirementsList((l) => l.filter((_, idx) => idx !== i))} className="ml-1 opacity-50 hover:opacity-100">✕</button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Preview / publish */}
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Activity Image</h2>
            <div className="aspect-video rounded-xl bg-gradient-to-br from-ink-light-grey to-ink-off-white border border-ink-light-grey flex flex-col items-center justify-center gap-2">
              <ImageIcon size={28} className="text-ink-dark-grey/30" />
              <p className="text-xs text-ink-dark-grey/45 tracking-tight">Image placeholder</p>
            </div>
            <p className="text-2xs text-ink-dark-grey/45 mt-2 tracking-tight">Upload an image when Firebase Storage is connected.</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-3">Preview</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Name</span><span className="font-medium text-ink-charcoal tracking-tight">{form.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Category</span><span className="font-medium text-ink-charcoal">{form.category}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Date</span><span className="font-medium text-ink-charcoal">{form.date || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Capacity</span><span className="font-medium text-ink-charcoal tabular-nums">{form.capacity}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Method</span><span className="font-medium text-ink-charcoal">{form.attendanceMethod}</span></div>
            </div>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={submit}>
            <Check size={18} /> Publish Activity
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
