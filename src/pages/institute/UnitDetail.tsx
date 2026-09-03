import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { Modal } from '@/components/ui/Modal';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader, SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Shelf, ShelfItem } from '@/components/ui/Shelf';
import { ActivityCard } from '@/components/student/ActivityCard';
import { RegisterReportCard } from '@/components/institute/RegisterReportCard';
import { UNIT_STAFF_CATEGORIES, type UnitStaff, type UnitStaffCategory } from '@/types';
import { initials } from '@/utils/format';
import { ArrowLeft, Mail, Network, UserRound, Plus, Pencil, Trash2 } from 'lucide-react';

interface StaffDraft {
  id?: string;
  name: string;
  category: UnitStaffCategory;
  title: string;
  email: string;
  focus: string;
  status: 'active' | 'inactive';
}

const emptyStaff = (category: UnitStaffCategory): StaffDraft => ({
  name: '', category, title: '', email: '', focus: '', status: 'active',
});

const toStaffDraft = (s: UnitStaff): StaffDraft => ({
  id: s.id, name: s.name, category: s.category, title: s.title,
  email: s.email, focus: s.focus, status: s.status,
});

export function UnitDetail() {
  const { units, unitStaff, activities, role, saveUnitStaff, deleteUnitStaff, pushToast } = useApp();
  const { params, navigate, back } = useNav();
  const [draft, setDraft] = useState<StaffDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UnitStaff | null>(null);

  const unit = units.find((u) => u.id === params.id);
  const isAdmin = role === 'admin';

  if (!unit) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Network size={24} />}
          title="Unit not found"
          description="This unit is no longer available."
          action={<Button variant="outline" size="sm" onClick={back}>Back</Button>}
        />
      </PageContainer>
    );
  }

  const staff = unitStaff.filter((s) => s.unitId === unit.id);
  const unitActivities = activities.filter((a) => {
    const organizer = a.organizer.toLowerCase();
    return organizer === unit.name.toLowerCase() || organizer.includes(unit.shortName.toLowerCase());
  });
  const upcoming = unitActivities.filter((a) => a.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date));
  const registers = unitActivities.filter((a) => a.status !== 'upcoming').sort((a, b) => b.date.localeCompare(a.date));

  const openRegister = (activityId: string) =>
    navigate(role === 'admin' ? 'admin-attendance' : 'activity-detail', { id: activityId });

  const submitStaff = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      pushToast('Give the person a name', 'error');
      return;
    }
    setSaving(true);
    const ok = await saveUnitStaff({
      id: draft.id,
      unitId: unit.id,
      name: draft.name.trim(),
      category: draft.category,
      title: draft.title.trim(),
      email: draft.email.trim(),
      focus: draft.focus.trim(),
      status: draft.status,
    });
    setSaving(false);
    if (ok) setDraft(null);
  };

  const field =
    'w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35';
  const label = 'text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block';

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <button
        onClick={back}
        className="inline-flex items-center gap-1.5 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight mb-5"
      >
        <ArrowLeft size={16} /> Units
      </button>

      <PageHeader title={unit.name} subtitle={unit.focus} />

      <Card className="mt-6" hover={false}>
        <p className="text-sm text-ink-dark-grey/75 tracking-tight leading-relaxed">{unit.description}</p>
        <div className="mt-4 pt-4 border-t border-ink-light-grey flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-dark-grey/70 tracking-tight">
          {unit.lead && <span className="flex items-center gap-2"><UserRound size={14} /> {unit.lead}</span>}
          {unit.email && <span className="flex items-center gap-2"><Mail size={14} /> {unit.email}</span>}
          <span className="flex items-center gap-2"><Network size={14} /> {staff.length} people</span>
        </div>
      </Card>

      {/* People by category */}
      <div className="mt-10">
        <SectionHeader title="People in this unit" subtitle="Permanent staff, committee members, champions, trainees, interns and assistants." />
        <div className="mt-5 flex flex-col gap-6">
          {UNIT_STAFF_CATEGORIES.map((category) => {
            const people = staff.filter((s) => s.category === category);
            // Students only see groups that have people; admins see every group
            // so there is always somewhere to add to.
            if (people.length === 0 && !isAdmin) return null;
            return (
              <div key={category}>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">{category}</h3>
                  <span className="text-2xs text-ink-dark-grey/50 tabular-nums">{people.length}</span>
                  <span className="flex-1 h-px bg-ink-light-grey" />
                  {isAdmin && (
                    <button
                      onClick={() => setDraft(emptyStaff(category))}
                      className="shrink-0 inline-flex items-center gap-1 text-2xs font-medium text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight"
                    >
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
                {people.length === 0 ? (
                  <p className="text-xs text-ink-dark-grey/45 mt-3 tracking-tight">Nobody recorded in this group yet.</p>
                ) : (
                  <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {people.map((person) => (
                      <Card key={person.id} className="flex items-start gap-3" hover={false}>
                        <Avatar initials={initials(person.name)} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{person.name}</p>
                          {person.title && <p className="text-xs text-ink-dark-grey/60 mt-0.5 tracking-tight truncate">{person.title}</p>}
                          {person.focus && <p className="text-xs text-ink-dark-grey/50 mt-1.5 tracking-tight line-clamp-2">{person.focus}</p>}
                          {person.email && (
                            <p className="text-xs text-ink-dark-grey/45 mt-1.5 tracking-tight truncate">{person.email}</p>
                          )}
                          {isAdmin && (
                            <div className="flex items-center gap-3 mt-2.5">
                              <button
                                onClick={() => setDraft(toStaffDraft(person))}
                                className="inline-flex items-center gap-1 text-2xs text-ink-dark-grey/60 hover:text-ink-charcoal tracking-tight"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmDelete(person)}
                                className="inline-flex items-center gap-1 text-2xs text-ink-dark-grey/60 hover:text-ink-charcoal tracking-tight"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                        {person.status === 'inactive' && <Badge tone="light">Inactive</Badge>}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {staff.length === 0 && !isAdmin && (
            <EmptyState icon={<UserRound size={24} />} title="No people captured" description="Staff for this unit have not been added yet." />
          )}
        </div>
      </div>

      {/* Upcoming activities shelf */}
      <div className="mt-10">
        <Shelf
          title="Upcoming activities"
          subtitle={upcoming.length > 0 ? `${upcoming.length} scheduled by this unit` : undefined}
          action={
            <button
              onClick={() => navigate(role === 'admin' ? 'admin-activities' : 'activities')}
              className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight"
            >
              View all
            </button>
          }
        >
          {upcoming.length === 0 ? (
            <ShelfItem className="w-full">
              <Card hover={false} className="text-sm text-ink-dark-grey/60 tracking-tight">
                No upcoming activities are scheduled by this unit.
              </Card>
            </ShelfItem>
          ) : (
            upcoming.map((a) => (
              <ShelfItem key={a.id}>
                <ActivityCard activity={a} />
              </ShelfItem>
            ))
          )}
        </Shelf>
      </div>

      {/* Register report shelf */}
      <div className="mt-10">
        <Shelf title="Register reports" subtitle="Attendance registers for this unit's activities.">
          {registers.length === 0 ? (
            <ShelfItem className="w-full">
              <Card hover={false} className="text-sm text-ink-dark-grey/60 tracking-tight">
                No registers yet — they open once an activity starts.
              </Card>
            </ShelfItem>
          ) : (
            registers.map((a) => (
              <ShelfItem key={a.id}>
                <RegisterReportCard activity={a} onOpen={() => openRegister(a.id)} />
              </ShelfItem>
            ))
          )}
        </Shelf>
      </div>

      {/* Add / edit person */}
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit person' : 'Add person'}>
        {draft && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Full name *</label>
              <input className={field} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Dr. L. Netshandama" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Group</label>
                <select
                  className={field}
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as UnitStaffCategory })}
                >
                  {UNIT_STAFF_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Status</label>
                <select
                  className={field}
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Title / role</label>
              <input className={field} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Senior Researcher" />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={field} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@univen.ac.za" />
            </div>
            <div>
              <label className={label}>Focus area</label>
              <input className={field} value={draft.focus} onChange={(e) => setDraft({ ...draft, focus: e.target.value })} placeholder="e.g. Household food security" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" fullWidth onClick={() => setDraft(null)}>Cancel</Button>
              <Button fullWidth onClick={submitStaff} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add person'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove person">
        {confirmDelete && (
          <div>
            <p className="text-sm text-ink-dark-grey/75 tracking-tight">
              Remove <span className="font-semibold text-ink-charcoal">{confirmDelete.name}</span> from {unit.shortName}?
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button fullWidth onClick={async () => { await deleteUnitStaff(confirmDelete.id); setConfirmDelete(null); }}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
