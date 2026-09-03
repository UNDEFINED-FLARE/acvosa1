import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { UnitCard } from '@/components/institute/UnitCard';
import type { Unit } from '@/types';
import { Network, Users, Lightbulb, GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';

interface Draft {
  id?: string;
  name: string;
  shortName: string;
  focus: string;
  description: string;
  lead: string;
  email: string;
  position: string;
}

const emptyDraft = (position: number): Draft => ({
  name: '', shortName: '', focus: '', description: '', lead: '', email: '',
  position: String(position),
});

const toDraft = (u: Unit): Draft => ({
  id: u.id,
  name: u.name,
  shortName: u.shortName,
  focus: u.focus,
  description: u.description,
  lead: u.lead,
  email: u.email,
  position: String(u.position),
});

export function UnitsPage() {
  const { units, unitStaff, role, saveUnit, deleteUnit, pushToast } = useApp();
  const { navigate } = useNav();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Unit | null>(null);

  const isAdmin = role === 'admin';
  const champions = unitStaff.filter((s) => s.category === 'Innovation Champion').length;
  const committee = unitStaff.filter((s) => s.category === 'Postgraduate Committee').length;

  const submit = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      pushToast('Give the unit a name', 'error');
      return;
    }
    setSaving(true);
    const ok = await saveUnit({
      id: draft.id,
      name: draft.name.trim(),
      shortName: draft.shortName.trim() || draft.name.trim(),
      focus: draft.focus.trim(),
      description: draft.description.trim(),
      lead: draft.lead.trim(),
      email: draft.email.trim(),
      position: parseInt(draft.position, 10) || units.length + 1,
    });
    setSaving(false);
    if (ok) setDraft(null);
  };

  const field =
    'w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35';
  const label = 'text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block';

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Institute Units"
          subtitle="The research and support units of the Institute for Rural Development and the people in each."
        />
        {isAdmin && (
          <Button size="sm" className="shrink-0" onClick={() => setDraft(emptyDraft(units.length + 1))}>
            <Plus size={16} /> New Unit
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Units" value={units.length} icon={<Network size={16} />} />
        <StatTile label="People" value={unitStaff.length} icon={<Users size={16} />} />
        <StatTile label="Innovation Champions" value={champions} icon={<Lightbulb size={16} />} />
        <StatTile label="Postgraduate Committee" value={committee} icon={<GraduationCap size={16} />} />
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={<Network size={24} />}
          title="No units yet"
          description={isAdmin ? 'Add the first unit to start capturing its people and activities.' : 'Institute units will appear here once they have been captured.'}
          action={isAdmin ? <Button onClick={() => setDraft(emptyDraft(1))}><Plus size={16} /> New Unit</Button> : undefined}
        />
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <div key={unit.id} className="relative group/unit">
              <UnitCard
                unit={unit}
                staff={unitStaff.filter((s) => s.unitId === unit.id)}
                onOpen={() => navigate('unit-detail', { id: unit.id })}
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/unit:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDraft(toDraft(unit)); }}
                    aria-label={`Edit ${unit.name}`}
                    className="w-8 h-8 rounded-lg bg-ink-white border border-ink-light-grey flex items-center justify-center text-ink-dark-grey/70 hover:text-ink-charcoal hover:border-ink-grey transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(unit); }}
                    aria-label={`Delete ${unit.name}`}
                    className="w-8 h-8 rounded-lg bg-ink-white border border-ink-light-grey flex items-center justify-center text-ink-dark-grey/70 hover:text-ink-charcoal hover:border-ink-grey transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit Unit' : 'New Unit'}>
        {draft && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Unit name *</label>
              <input className={field} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Rural Innovation and Enterprise Development" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Short name</label>
                <input className={field} value={draft.shortName} onChange={(e) => setDraft({ ...draft, shortName: e.target.value })} placeholder="e.g. Innovation & Enterprise" />
              </div>
              <div>
                <label className={label}>Order</label>
                <input type="number" min={1} className={field} value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Focus</label>
              <input className={field} value={draft.focus} onChange={(e) => setDraft({ ...draft, focus: e.target.value })} placeholder="One line on what the unit works on" />
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea className={`${field} h-24 py-3 resize-none`} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Unit lead</label>
                <input className={field} value={draft.lead} onChange={(e) => setDraft({ ...draft, lead: e.target.value })} placeholder="e.g. Prof. M. Rambau" />
              </div>
              <div>
                <label className={label}>Email</label>
                <input className={field} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="unit@univen.ac.za" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" fullWidth onClick={() => setDraft(null)}>Cancel</Button>
              <Button fullWidth onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add unit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete unit">
        {confirmDelete && (
          <div>
            <p className="text-sm text-ink-dark-grey/75 tracking-tight">
              Remove <span className="font-semibold text-ink-charcoal">{confirmDelete.name}</span> and everyone recorded in it?
              This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button fullWidth onClick={async () => { await deleteUnit(confirmDelete.id); setConfirmDelete(null); }}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
